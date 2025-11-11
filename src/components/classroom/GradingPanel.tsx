'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, XCircle, Clock, Eye, 
  Edit, Save, Award, Filter, Download,
  FileText, AlertCircle, Users
} from 'lucide-react';
import { classroomService } from '@/lib/services/classroom.service';

interface GradingPanelProps {
  classroomId: number;
}

export default function GradingPanel({ classroomId }: GradingPanelProps) {
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContentItems();
  }, [classroomId]);

  useEffect(() => {
    if (selectedContent) {
      loadSubmissions(selectedContent.id);
    }
  }, [selectedContent]);

  const loadContentItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const summary = await classroomService.getClassroomSummary(classroomId);
      
      // Filter only assignments and quizzes
      const gradableItems = summary.contentItems?.filter(
        (item: any) => item.type === 'ASSIGNMENT' || item.type === 'QUIZ'
      ) || [];
      
      setContentItems(gradableItems);
      
      if (gradableItems.length > 0 && !selectedContent) {
        setSelectedContent(gradableItems[0]);
      }
    } catch (err: any) {
      setError('Không thể tải danh sách bài tập: ' + err.message);
      console.error('Error loading content items:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (contentId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const subs = await classroomService.getAllSubmissions(contentId);
      setSubmissions(subs);
    } catch (err: any) {
      setError('Không thể tải danh sách bài nộp: ' + err.message);
      console.error('Error loading submissions:', err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    
    // Check if there's existing grade
    const existingGrade = submission.grade || submission.score;
    setScore(existingGrade?.toString() || '');
    setFeedback(submission.feedback || '');
    setGradeDialogOpen(true);
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;

    const scoreValue = parseFloat(score);
    if (isNaN(scoreValue) || scoreValue < 0) {
      alert('Điểm không hợp lệ!');
      return;
    }

    // Validate max points
    const maxPoints = selectedContent?.maxPoints || 100;
    if (scoreValue > maxPoints) {
      alert(`Điểm không được vượt quá ${maxPoints}!`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Call grading API
      await classroomService.gradeSubmission(
        selectedSubmission.id, 
        scoreValue, 
        feedback.trim() || undefined
      );

      // Update local state
      setSubmissions(prev =>
        prev.map(sub =>
          sub.id === selectedSubmission.id
            ? { 
                ...sub, 
                score: scoreValue, 
                grade: scoreValue,
                feedback: feedback.trim(), 
                status: 'GRADED' 
              }
            : sub
        )
      );

      setGradeDialogOpen(false);
      alert('Chấm điểm thành công!');
      
      // Reload to get updated data
      if (selectedContent) {
        await loadSubmissions(selectedContent.id);
      }
    } catch (err: any) {
      setError('Lưu điểm thất bại: ' + err.message);
      console.error('Error saving grade:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportGrades = () => {
    if (submissions.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    // Prepare CSV data
    const headers = ['STT', 'Họ tên', 'Email', 'Thời gian nộp', 'Điểm', 'Trạng thái', 'Phản hồi'];
    const rows = submissions.map((sub, idx) => [
      idx + 1,
      sub.studentName || 'N/A',
      sub.studentEmail || 'N/A',
      new Date(sub.submittedAt).toLocaleString('vi-VN'),
      sub.score !== null && sub.score !== undefined ? sub.score : 'Chưa chấm',
      sub.status,
      (sub.feedback || '').replace(/"/g, '""') // Escape quotes
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `grades_${selectedContent?.title || 'export'}_${Date.now()}.csv`;
    link.click();
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return sub.status === 'SUBMITTED' || sub.status === 'PENDING';
    if (filterStatus === 'graded') return sub.status === 'GRADED';
    if (filterStatus === 'late') return sub.status === 'LATE';
    return true;
  });

  const stats = {
    total: submissions.length,
    graded: submissions.filter(s => s.status === 'GRADED').length,
    pending: submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'PENDING').length,
    averageScore: submissions.length > 0
      ? submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.filter(s => s.score !== null).length
      : 0
  };

  const getStatusBadge = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case 'PENDING':
      case 'SUBMITTED':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Chờ chấm</Badge>;
      case 'GRADED':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" /> Đã chấm</Badge>;
      case 'LATE':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Nộp muộn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading && contentItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Chọn bài tập/quiz để chấm điểm</CardTitle>
        </CardHeader>
        <CardContent>
          {contentItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có bài tập hoặc quiz nào</p>
          ) : (
            <Select 
              value={selectedContent?.id?.toString()} 
              onValueChange={(value) => {
                const content = contentItems.find(c => c.id.toString() === value);
                setSelectedContent(content);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn bài tập/quiz" />
              </SelectTrigger>
              <SelectContent>
                {contentItems.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{item.title}</span>
                      <Badge variant="outline" className="ml-2">{item.type}</Badge>
                      {item.submissionCount > 0 && (
                        <Badge variant="secondary">{item.submissionCount} bài nộp</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedContent && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Tổng số bài nộp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Chờ chấm điểm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Đã chấm điểm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats.graded}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Điểm trung bình
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {stats.graded > 0 ? stats.averageScore.toFixed(1) : '0.0'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Submissions List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách bài nộp</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="pending">Chờ chấm</SelectItem>
                      <SelectItem value="graded">Đã chấm</SelectItem>
                      <SelectItem value="late">Nộp muộn</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleExportGrades}
                    disabled={submissions.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Xuất CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Không có bài nộp nào</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Học sinh</TableHead>
                        <TableHead>Ngày nộp</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-center">Điểm</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions.map((submission, idx) => (
                        <TableRow key={submission.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-medium">
                            {submission.studentName || `Student #${submission.studentId}`}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell>{getStatusBadge(submission.status)}</TableCell>
                          <TableCell className="text-center">
                            {submission.score !== null && submission.score !== undefined ? (
                              <div className="inline-flex items-center gap-1 font-semibold">
                                <Award className="w-4 h-4 text-yellow-500" />
                                {submission.score}/{selectedContent.maxPoints || 100}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // TODO: Show submission detail
                                  console.log('View submission:', submission);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGradeSubmission(submission)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Grading Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chấm điểm bài nộp</DialogTitle>
            <DialogDescription>
              Nhập điểm và nhận xét cho bài làm của học sinh
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedSubmission && (
              <>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">Học sinh</Label>
                    <p className="font-medium">
                      {selectedSubmission.studentName || `Student #${selectedSubmission.studentId}`}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Bài tập</Label>
                    <p className="font-medium">{selectedContent?.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Thời gian nộp</Label>
                    <p className="text-sm">
                      {new Date(selectedSubmission.submittedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Trạng thái</Label>
                    <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                  </div>
                </div>

                {/* Submission content preview */}
                {selectedSubmission.content && (
                  <div className="border rounded-md p-4">
                    <Label className="text-sm font-medium">Nội dung bài làm</Label>
                    <div className="mt-2 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {selectedSubmission.content}
                    </div>
                  </div>
                )}

                {selectedSubmission.fileIds && (
                  <div>
                    <Label className="text-sm font-medium">File đã nộp</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedSubmission.fileIds.split(',').length} file(s)
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="grade-score">
                    Điểm (0-{selectedContent?.maxPoints || 100}) *
                  </Label>
                  <Input
                    id="grade-score"
                    type="number"
                    min="0"
                    max={selectedContent?.maxPoints || 100}
                    step="0.5"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Nhập điểm"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade-feedback">Nhận xét</Label>
                  <Textarea
                    id="grade-feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Nhập nhận xét cho học sinh..."
                    rows={5}
                    disabled={submitting}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setGradeDialogOpen(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSaveGrade} 
              disabled={submitting || !score}
            >
              <Save className="w-4 h-4 mr-2" />
              {submitting ? 'Đang lưu...' : 'Lưu điểm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
