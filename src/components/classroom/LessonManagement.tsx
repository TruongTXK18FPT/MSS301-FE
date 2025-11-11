'use client';

import { useState, useEffect } from 'react';
import { classroomService } from '@/lib/services/classroom.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus, Search, Eye, Edit, Trash2, BookOpen,
  FileText, Clock, AlertCircle, Upload, Download
} from 'lucide-react';

interface LessonManagementProps {
  classroomId: number;
  isTeacher: boolean;
}

interface Lesson {
  id: number;
  title: string;
  description?: string;
  content: string;
  publishAt?: string;
  dueAt?: string;
  visible: boolean;
  orderIndex: number;
  createdAt?: string;
  contentId?: number; // Lesson entity ID
}

export default function LessonManagement({ classroomId, isTeacher }: LessonManagementProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create/Edit Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [saving, setSaving] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content: '',
    visible: true,
    publishAt: '',
  });

  // View Dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    loadLessons();
  }, [classroomId, isTeacher]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get classroom contents filtered by type=LESSON
      const contents = await classroomService.getClassroomContents(classroomId, !isTeacher);
      const lessonContents = contents.filter((item: any) => item.type === 'LESSON');
      
      // Transform to Lesson format
      const transformedLessons: Lesson[] = lessonContents.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        content: item.content || '',
        publishAt: item.publishAt,
        dueAt: item.dueAt,
        visible: item.visible,
        orderIndex: item.orderIndex,
        createdAt: item.createdAt,
        contentId: item.contentId,
      }));

      setLessons(transformedLessons);
    } catch (err: any) {
      setError('Không thể tải danh sách bài giảng: ' + err.message);
      console.error('Error loading lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = () => {
    setEditingLesson(null);
    setLessonForm({
      title: '',
      description: '',
      content: '',
      visible: true,
      publishAt: '',
    });
    setDialogOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content,
      visible: lesson.visible,
      publishAt: lesson.publishAt || '',
    });
    setDialogOpen(true);
  };

  const handleViewLesson = (lesson: Lesson) => {
    setViewingLesson(lesson);
    setViewDialogOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!lessonForm.title.trim() || !lessonForm.content.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const lessonData = {
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim(),
        content: lessonForm.content.trim(),
        type: 'LESSON',
        visible: lessonForm.visible,
        publishAt: lessonForm.publishAt || undefined,
        orderIndex: 0
      };

      if (editingLesson && editingLesson.contentId) {
        // Update existing lesson
        await classroomService.updateLesson(classroomId, editingLesson.contentId, lessonData);
        alert('Cập nhật bài giảng thành công!');
      } else {
        // Create new lesson
        await classroomService.createLesson(classroomId, lessonData);
        alert('Tạo bài giảng thành công!');
      }

      setDialogOpen(false);
      await loadLessons();
    } catch (err: any) {
      setError('Lưu bài giảng thất bại: ' + err.message);
      console.error('Error saving lesson:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson || !lesson.contentId) {
      alert('Không tìm thấy bài giảng!');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa bài giảng này?')) {
      return;
    }

    try {
      setError(null);
      await classroomService.deleteLesson(classroomId, lesson.contentId);
      alert('Xóa bài giảng thành công!');
      await loadLessons();
    } catch (err: any) {
      setError('Xóa bài giảng thất bại: ' + err.message);
      console.error('Error deleting lesson:', err);
    }
  };

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
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

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Quản lý bài giảng
            </CardTitle>
            {isTeacher && (
              <Button onClick={handleCreateLesson}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo bài giảng
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài giảng..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <Card>
        <CardContent className="pt-6">
          {filteredLessons.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {lessons.length === 0 ? 'Chưa có bài giảng nào' : 'Không tìm thấy bài giảng'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{lesson.title}</CardTitle>
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {lesson.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <Clock className="w-3 h-3" />
                      {lesson.createdAt 
                        ? new Date(lesson.createdAt).toLocaleDateString('vi-VN')
                        : 'N/A'}
                      {lesson.publishAt && (
                        <Badge variant="outline" className="ml-2">
                          Xuất bản: {new Date(lesson.publishAt).toLocaleDateString('vi-VN')}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewLesson(lesson)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Xem
                      </Button>
                      {isTeacher && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditLesson(lesson)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Chỉnh sửa bài giảng' : 'Tạo bài giảng mới'}
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin bài giảng cho lớp học
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="Nhập tiêu đề bài giảng"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả ngắn</Label>
              <Input
                id="description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Mô tả ngắn gọn nội dung bài giảng"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Nội dung bài giảng *</Label>
              <Textarea
                id="content"
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                placeholder="Nhập nội dung bài giảng (hỗ trợ Markdown)&#10;&#10;**Đậm**, *Nghiêng*, `code`, [link](url)&#10;&#10;- Danh sách&#10;1. Đánh số"
                rows={15}
                className="font-mono"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Hỗ trợ Markdown: **bold**, *italic*, `code`, [link](url), - list, 1. number
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publishAt">Thời gian xuất bản</Label>
                <Input
                  id="publishAt"
                  type="datetime-local"
                  value={lessonForm.publishAt}
                  onChange={(e) => setLessonForm({ ...lessonForm, publishAt: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="visible"
                    checked={lessonForm.visible}
                    onChange={(e) => setLessonForm({ ...lessonForm, visible: e.target.checked })}
                    disabled={saving}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="visible" className="cursor-pointer">
                    Hiển thị cho học sinh
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Hủy
            </Button>
            <Button
              onClick={handleSaveLesson}
              disabled={saving || !lessonForm.title.trim() || !lessonForm.content.trim()}
            >
              {saving ? 'Đang lưu...' : editingLesson ? 'Cập nhật' : 'Tạo bài giảng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingLesson?.title}</DialogTitle>
            {viewingLesson?.description && (
              <DialogDescription>{viewingLesson.description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {viewingLesson?.createdAt 
                  ? new Date(viewingLesson.createdAt).toLocaleString('vi-VN')
                  : 'N/A'}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                {viewingLesson?.content}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
