'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { contentService } from '@/lib/services/content.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import MathTextInput from './MathTextInput';
import LatexPreview from './LatexPreview';
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
  Plus, Search, Eye, Edit, Trash2, BookOpen,
  FileText, Video, Image, Link as LinkIcon,
  Clock, GraduationCap, Share2
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
  subject: string;
  grade: string;
  tags: string[];
  isPublic: boolean;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  attachments?: LessonAttachment[];
}

interface LessonAttachment {
  id: string;
  type: 'VIDEO' | 'IMAGE' | 'PDF' | 'LINK';
  name: string;
  url: string;
  size?: number;
}

export default function LessonManagement({ classroomId, isTeacher }: LessonManagementProps) {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  
  // Create/Edit Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content: '',
    subject: 'Toán học',
    grade: '9',
    tags: [] as string[],
    isPublic: false,
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadLessons();
  }, [classroomId]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const allContents = await contentService.getContentItemsByClassroom(classroomId);
      const lessonItems = allContents.filter((item: any) => item.type === 'LESSON');
      
      // Transform to Lesson format
      const transformedLessons: Lesson[] = lessonItems.map((item: any) => {
        let parsedContent: any = {};
        try {
          parsedContent = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
        } catch (e) {
          parsedContent = { text: item.content };
        }

        return {
          id: item.id,
          title: item.title,
          description: item.description || parsedContent.description || '',
          content: parsedContent.text || parsedContent.content || item.content || '',
          subject: parsedContent.subject || item.subject || 'Toán học',
          grade: parsedContent.grade || item.grade || '9',
          tags: parsedContent.tags || item.tags || [],
          isPublic: item.isPublic || false,
          status: item.status || 'published',
          createdAt: item.createdAt,
          updatedAt: item.updatedAt || item.createdAt,
          viewCount: parsedContent.viewCount,
          attachments: parsedContent.attachments,
        };
      });

      setLessons(transformedLessons);
    } catch (error) {
      console.error('Error loading lessons:', error);
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
      subject: 'Toán học',
      grade: '9',
      tags: [],
      isPublic: false,
    });
    setTagInput('');
    setDialogOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content,
      subject: lesson.subject,
      grade: lesson.grade,
      tags: lesson.tags,
      isPublic: lesson.isPublic,
    });
    setTagInput('');
    setDialogOpen(true);
  };

  const handleSaveLesson = async () => {
    try {
      const contentData = {
        title: lessonForm.title,
        description: lessonForm.description,
        type: 'LESSON' as const,
        content: JSON.stringify({
          text: lessonForm.content,
          subject: lessonForm.subject,
          grade: lessonForm.grade,
          tags: lessonForm.tags,
        }),
        classroomId: classroomId,
        isPublic: lessonForm.isPublic,
      };

      if (editingLesson) {
        await contentService.updateContentItem(editingLesson.id, contentData);
        alert('Cập nhật bài giảng thành công!');
      } else {
        await contentService.createContentItem(contentData);
        alert('Tạo bài giảng thành công!');
      }
      
      await loadLessons();
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving lesson:', error);
      alert('Lưu bài giảng thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Bạn có chắc muốn xóa bài giảng này?')) return;

    try {
      await contentService.deleteContentItem(lessonId);
      await loadLessons();
      alert('Xóa bài giảng thành công!');
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      alert('Xóa bài giảng thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewLesson = (lessonId: number) => {
    router.push(`/classroom/${classroomId}/lesson/${lessonId}`);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !lessonForm.tags.includes(tagInput.trim())) {
      setLessonForm({
        ...lessonForm,
        tags: [...lessonForm.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setLessonForm({
      ...lessonForm,
      tags: lessonForm.tags.filter(t => t !== tag),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Đã xuất bản</Badge>;
      case 'draft':
        return <Badge variant="secondary">Bản nháp</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-4 h-4" />;
      case 'IMAGE':
        return <Image className="w-4 h-4" />;
      case 'PDF':
        return <FileText className="w-4 h-4" />;
      case 'LINK':
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = filterSubject === 'all' || lesson.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bài giảng ({lessons.length})</CardTitle>
            {isTeacher && (
              <Button onClick={handleCreateLesson}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo bài giảng mới
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
                placeholder="Tìm kiếm bài giảng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn</SelectItem>
                <SelectItem value="Toán học">Toán học</SelectItem>
                <SelectItem value="Vật lý">Vật lý</SelectItem>
                <SelectItem value="Hóa học">Hóa học</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lessons List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? 'Không tìm thấy bài giảng nào' : 'Chưa có bài giảng nào'}
              </p>
              {isTeacher && !searchQuery && (
                <Button onClick={handleCreateLesson} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo bài giảng đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold">{lesson.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(lesson.status)}
                          {lesson.isPublic && (
                            <Badge variant="outline">
                              <Share2 className="w-3 h-3 mr-1" />
                              Công khai
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {lesson.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {lesson.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="secondary">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        {lesson.subject}
                      </Badge>
                      <Badge variant="secondary">Lớp {lesson.grade}</Badge>
                      {lesson.viewCount !== undefined && (
                        <Badge variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          {lesson.viewCount} lượt xem
                        </Badge>
                      )}
                    </div>

                    {lesson.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {lesson.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-secondary/50 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {lesson.attachments && lesson.attachments.length > 0 && (
                      <div className="mb-3 space-y-1">
                        {lesson.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                            {getAttachmentIcon(attachment.type)}
                            <span>{attachment.name}</span>
                            {attachment.size && <span className="text-xs">({formatFileSize(attachment.size)})</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Cập nhật: {new Date(lesson.updatedAt).toLocaleDateString('vi-VN')}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewLesson(lesson.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem
                        </Button>
                        {isTeacher && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLesson(lesson)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
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

      {/* Create/Edit Lesson Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Chỉnh sửa bài giảng' : 'Tạo bài giảng mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề *</label>
              <Input
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="Nhập tiêu đề bài giảng"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả ngắn</label>
              <Input
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Mô tả ngắn gọn nội dung bài giảng"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Môn học *</label>
                <Select
                  value={lessonForm.subject}
                  onValueChange={(value) => setLessonForm({ ...lessonForm, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Toán học">Toán học</SelectItem>
                    <SelectItem value="Vật lý">Vật lý</SelectItem>
                    <SelectItem value="Hóa học">Hóa học</SelectItem>
                    <SelectItem value="Sinh học">Sinh học</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lớp *</label>
                <Select
                  value={lessonForm.grade}
                  onValueChange={(value) => setLessonForm({ ...lessonForm, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
                      <SelectItem key={grade} value={String(grade)}>
                        Lớp {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <MathTextInput
                label="Nội dung bài giảng *"
                value={lessonForm.content}
                onChange={(content) => setLessonForm({ ...lessonForm, content })}
                placeholder="Nhập nội dung bài giảng (hỗ trợ $công thức toán$, $$công thức block$$, và ![hình ảnh])"
                rows={12}
                allowImage={true}
                folder="lesson-content"
              />
              <p className="text-xs text-muted-foreground">
                Hỗ trợ LaTeX: $x^2$, $$\int$$, Markdown và hình ảnh
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Nhập tag và Enter"
                />
                <Button type="button" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {lessonForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {lessonForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={lessonForm.isPublic}
                onChange={(e) => setLessonForm({ ...lessonForm, isPublic: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isPublic" className="text-sm">
                Công khai bài giảng (cho phép các lớp khác xem)
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSaveLesson}
              disabled={!lessonForm.title || !lessonForm.content}
            >
              {editingLesson ? 'Cập nhật' : 'Tạo bài giảng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
