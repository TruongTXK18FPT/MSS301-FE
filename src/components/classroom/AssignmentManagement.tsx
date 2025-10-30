'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { contentService } from '@/lib/services/content.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus, Search, Eye, Edit, Trash2, Download,
  FileText, Clock, Calendar, CheckCircle, AlertCircle,
  Upload, Users, BarChart
} from 'lucide-react';

interface AssignmentManagementProps {
  classroomId: number;
  isTeacher: boolean;
}

interface Assignment {
  id: number;
  title: string;
  description?: string;
  instructions: string;
  submissionType: 'TEXT' | 'FILE' | 'BOTH';
  dueDate: string;
  totalPoints: number;
  attachmentFileIds?: string[];
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  submissionCount?: number;
  gradedCount?: number;
  averageScore?: number;
}

export default function AssignmentManagement({ classroomId, isTeacher }: AssignmentManagementProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Create/Edit Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    instructions: '',
    submissionType: 'BOTH' as 'TEXT' | 'FILE' | 'BOTH',
    dueDate: '',
    totalPoints: 10,
    attachmentFileIds: [] as string[],
  });

  useEffect(() => {
    loadAssignments();
  }, [classroomId]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const allContents = await contentService.getContentItemsByClassroom(classroomId);
      const assignmentItems = allContents.filter((item: any) => item.type === 'ASSIGNMENT');
      
      // Transform to Assignment format
      const transformedAssignments: Assignment[] = await Promise.all(
        assignmentItems.map(async (item: any) => {
          let parsedContent: any = {};
          try {
            parsedContent = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
          } catch (e) {
            parsedContent = { instructions: item.content };
          }

          // Get submission stats
          let submissionCount = 0;
          let gradedCount = 0;
          let averageScore: number | undefined;

          try {
            const submissions = await contentService.getSubmissions(item.id);
            submissionCount = submissions.length;
            gradedCount = submissions.filter((s: any) => s.status === 'GRADED').length;
            
            const gradedSubmissions = submissions.filter((s: any) => s.grade != null);
            if (gradedSubmissions.length > 0) {
              const totalScore = gradedSubmissions.reduce((sum: number, s: any) => sum + (s.grade || 0), 0);
              averageScore = totalScore / gradedSubmissions.length;
            }
          } catch (error) {
            console.error('Error loading submission stats:', error);
          }

          return {
            id: item.id,
            title: item.title,
            description: item.description || '',
            instructions: parsedContent.instructions || item.content || '',
            submissionType: parsedContent.submissionType || 'BOTH',
            dueDate: parsedContent.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            totalPoints: parsedContent.totalPoints || 10,
            attachmentFileIds: parsedContent.attachmentFileIds || [],
            status: item.status || 'published',
            createdAt: item.createdAt,
            submissionCount,
            gradedCount,
            averageScore,
          };
        })
      );

      setAssignments(transformedAssignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setAssignmentForm({
      title: '',
      description: '',
      instructions: '',
      submissionType: 'BOTH',
      dueDate: '',
      totalPoints: 10,
      attachmentFileIds: [],
    });
    setDialogOpen(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description || '',
      instructions: assignment.instructions,
      submissionType: assignment.submissionType,
      dueDate: assignment.dueDate,
      totalPoints: assignment.totalPoints,
      attachmentFileIds: assignment.attachmentFileIds || [],
    });
    setDialogOpen(true);
  };

  const handleSaveAssignment = async () => {
    try {
      const contentData = {
        title: assignmentForm.title,
        description: assignmentForm.description,
        type: 'ASSIGNMENT' as const,
        content: JSON.stringify({
          instructions: assignmentForm.instructions,
          submissionType: assignmentForm.submissionType,
          dueDate: assignmentForm.dueDate,
          totalPoints: assignmentForm.totalPoints,
          attachmentFileIds: assignmentForm.attachmentFileIds,
        }),
        classroomId: classroomId,
        isPublic: false,
      };

      if (editingAssignment) {
        await contentService.updateContentItem(editingAssignment.id, contentData);
        alert('Cập nhật bài tập thành công!');
      } else {
        await contentService.createContentItem(contentData);
        alert('Tạo bài tập thành công!');
      }
      
      await loadAssignments();
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving assignment:', error);
      alert('Lưu bài tập thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!confirm('Bạn có chắc muốn xóa bài tập này?')) return;

    try {
      await contentService.deleteContentItem(assignmentId);
      await loadAssignments();
      alert('Xóa bài tập thành công!');
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      alert('Xóa bài tập thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewSubmissions = (assignmentId: number) => {
    router.push(`/classroom/${classroomId}/assignment/${assignmentId}`);
  };

  const handleSubmitAssignment = (assignmentId: number) => {
    router.push(`/classroom/${classroomId}/assignment/${assignmentId}`);
  };

  const getStatusBadge = (assignment: Assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (assignment.status === 'draft') {
      return <Badge variant="secondary">Bản nháp</Badge>;
    }
    
    if (assignment.status === 'closed') {
      return <Badge variant="outline">Đã đóng</Badge>;
    }
    
    if (dueDate < now) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Quá hạn
        </Badge>
      );
    }
    
    const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 2) {
      return (
        <Badge variant="default" className="bg-orange-500">
          <Clock className="w-3 h-3 mr-1" />
          Sắp hết hạn
        </Badge>
      );
    }
    
    return (
      <Badge variant="default">
        <CheckCircle className="w-3 h-3 mr-1" />
        Đang mở
      </Badge>
    );
  };

  const getSubmissionTypeLabel = (type: string) => {
    switch (type) {
      case 'TEXT':
        return 'Văn bản';
      case 'FILE':
        return 'File đính kèm';
      case 'BOTH':
        return 'Văn bản + File';
      default:
        return type;
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bài tập ({assignments.length})</CardTitle>
            {isTeacher && (
              <Button onClick={handleCreateAssignment}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo bài tập mới
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search & Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm bài tập..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="published">Đang mở</SelectItem>
                <SelectItem value="closed">Đã đóng</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignments List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? 'Không tìm thấy bài tập nào' : 'Chưa có bài tập nào'}
              </p>
              {isTeacher && !searchQuery && (
                <Button onClick={handleCreateAssignment} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo bài tập đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{assignment.title}</h3>
                          {getStatusBadge(assignment)}
                        </div>
                        
                        {assignment.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {assignment.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Hạn nộp: {formatDueDate(assignment.dueDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Upload className="w-4 h-4" />
                            <span>{getSubmissionTypeLabel(assignment.submissionType)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart className="w-4 h-4" />
                            <span>{assignment.totalPoints} điểm</span>
                          </div>
                        </div>

                        {assignment.submissionCount !== undefined && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span>
                                {assignment.submissionCount} bài nộp
                                {assignment.gradedCount !== undefined && ` (${assignment.gradedCount} đã chấm)`}
                              </span>
                            </div>
                            {assignment.averageScore !== undefined && (
                              <div className="flex items-center gap-1 font-semibold text-primary">
                                ĐTB: {assignment.averageScore.toFixed(1)}/{assignment.totalPoints}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {isTeacher ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewSubmissions(assignment.id)}
                              title="Xem bài nộp"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditAssignment(assignment)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              className="text-destructive hover:text-destructive"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => handleSubmitAssignment(assignment.id)}
                            disabled={assignment.status === 'closed'}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Nộp bài
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Assignment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAssignment ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề *</label>
              <Input
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                placeholder="Nhập tiêu đề bài tập"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả ngắn</label>
              <Input
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                placeholder="Mô tả ngắn gọn nội dung bài tập"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hướng dẫn chi tiết *</label>
              <Textarea
                value={assignmentForm.instructions}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                placeholder="Nhập hướng dẫn chi tiết cho học sinh"
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Loại bài nộp *</label>
                <Select
                  value={assignmentForm.submissionType}
                  onValueChange={(value: 'TEXT' | 'FILE' | 'BOTH') =>
                    setAssignmentForm({ ...assignmentForm, submissionType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXT">Văn bản</SelectItem>
                    <SelectItem value="FILE">File đính kèm</SelectItem>
                    <SelectItem value="BOTH">Cả hai</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Điểm tối đa *</label>
                <Input
                  type="number"
                  value={assignmentForm.totalPoints}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, totalPoints: parseInt(e.target.value) })}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hạn nộp *</label>
              <Input
                type="datetime-local"
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">File đính kèm</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Kéo thả file vào đây hoặc click để chọn
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max: 10MB)
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSaveAssignment}
              disabled={!assignmentForm.title || !assignmentForm.instructions || !assignmentForm.dueDate}
            >
              {editingAssignment ? 'Cập nhật' : 'Tạo bài tập'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
