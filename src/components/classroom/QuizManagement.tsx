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
  Plus, Search, Eye, Edit, Trash2, Copy,
  Clock, FileQuestion, CheckCircle, Play, BarChart, Sparkles
} from 'lucide-react';
import QuizBuilder from './QuizBuilder';
import AiQuizGeneratorModal from './AiQuizGeneratorModal';
import { aiQuizService } from '@/services/ai-quiz.service';

interface QuizManagementProps {
  classroomId: number;
  isTeacher: boolean;
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  timeLimitSec: number;
  totalQuestions: number;
  totalPoints: number;
  dueDate?: string;
  isPublic: boolean;
  shuffleQuestions: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  submissionCount?: number;
  averageScore?: number;
}

interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  points: number;
  options?: QuizOption[];
  correctAnswer?: string;
}

interface QuizOption {
  id: number;
  optionText: string;
  isCorrect: boolean;
}

export default function QuizManagement({ classroomId, isTeacher }: QuizManagementProps) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Create/Edit Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    timeLimitSec: 3600,
    shuffleQuestions: false,
    isPublic: false,
    dueDate: '',
  });

  // Question Builder Dialog
  const [questionBuilderOpen, setQuestionBuilderOpen] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // AI Quiz Generator
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, [classroomId]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const allContents = await contentService.getContentItemsByClassroom(classroomId);
      const quizItems = allContents.filter((item: any) => item.type === 'QUIZ');
      
      // Transform to Quiz format
      const transformedQuizzes: Quiz[] = await Promise.all(
        quizItems.map(async (item: any) => {
          let parsedContent: any = {};
          try {
            parsedContent = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
          } catch (e) {
            parsedContent = {};
          }

          // Get quiz details to count questions
          let quizDetails: any = null;
          let totalQuestions = 0;
          let totalPoints = 0;

          try {
            quizDetails = await contentService.getQuizByContentId(item.id);
            totalQuestions = quizDetails.questions?.length || 0;
            totalPoints = quizDetails.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || 0;
          } catch (error) {
            console.error('Error loading quiz details:', error);
          }

          // Get attempt stats
          let submissionCount = 0;
          let averageScore: number | undefined;

          try {
            const attempts = await contentService.getQuizAttempts(item.id);
            submissionCount = attempts.length;
            
            const completedAttempts = attempts.filter((a: any) => a.submittedAt && a.score != null);
            if (completedAttempts.length > 0) {
              const totalScore = completedAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0);
              averageScore = totalScore / completedAttempts.length / (totalPoints || 1) * 10; // Scale to /10
            }
          } catch (error) {
            console.error('Error loading quiz attempt stats:', error);
          }

          return {
            id: item.id,
            title: item.title,
            description: item.description || parsedContent.description || '',
            timeLimitSec: parsedContent.timeLimitSec || quizDetails?.timeLimitSec || 3600,
            totalQuestions,
            totalPoints,
            dueDate: parsedContent.dueDate,
            isPublic: item.isPublic || false,
            shuffleQuestions: parsedContent.shuffleQuestions || quizDetails?.shuffleQuestions || false,
            status: item.status || 'published',
            createdAt: item.createdAt,
            submissionCount,
            averageScore,
          };
        })
      );

      setQuizzes(transformedQuizzes);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({
      title: '',
      description: '',
      timeLimitSec: 3600,
      shuffleQuestions: false,
      isPublic: false,
      dueDate: '',
    });
    setDialogOpen(true);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description || '',
      timeLimitSec: quiz.timeLimitSec,
      shuffleQuestions: quiz.shuffleQuestions,
      isPublic: quiz.isPublic,
      dueDate: quiz.dueDate || '',
    });
    setDialogOpen(true);
  };

  const handleSaveQuiz = async () => {
    try {
      const contentData = {
        title: quizForm.title,
        description: quizForm.description,
        type: 'QUIZ' as const,
        content: JSON.stringify({
          timeLimitSec: quizForm.timeLimitSec,
          shuffleQuestions: quizForm.shuffleQuestions,
          dueDate: quizForm.dueDate,
        }),
        classroomId: classroomId,
        isPublic: quizForm.isPublic,
      };

      let quizId: number;
      if (editingQuiz) {
        await contentService.updateContentItem(editingQuiz.id, contentData);
        quizId = editingQuiz.id;
        
        // Update quiz settings
        await contentService.createOrUpdateQuiz(quizId, {
          timeLimitSec: quizForm.timeLimitSec,
          shuffleQuestions: quizForm.shuffleQuestions,
          questions: [], // Keep existing questions
        });
        alert('Cập nhật quiz thành công!');
      } else {
        const created = await contentService.createContentItem(contentData);
        quizId = created.id;
        
        // Don't create empty quiz record here - it will be created when adding first question
        // This avoids duplicate quiz records
        alert('Tạo quiz thành công! Hãy thêm câu hỏi.');
      }
      
      await loadQuizzes();
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      alert('Lưu quiz thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm('Bạn có chắc muốn xóa quiz này?')) return;

    try {
      await contentService.deleteContentItem(quizId);
      await loadQuizzes();
      alert('Xóa quiz thành công!');
    } catch (error: any) {
      console.error('Error deleting quiz:', error);
      alert('Xóa quiz thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleManageQuestions = (quizId: number) => {
    setCurrentQuizId(quizId);
    setQuestionBuilderOpen(true);
  };

  const handleCreateWithAI = async (topic: string, grade: string, numQuestions: number) => {
    try {
      setGeneratingAI(true);

      // 1. Tạo quiz mới trước
      const contentData = {
        title: topic,
        description: `Quiz được tạo bằng AI về ${topic} cho lớp ${grade}`,
        type: 'QUIZ' as const,
        content: JSON.stringify({
          timeLimitSec: 1800,
          shuffleQuestions: true,
        }),
        classroomId: classroomId,
        isPublic: false,
      };

      const created = await contentService.createContentItem(contentData);

      // 2. Generate questions với AI
      const generatedQuestions = await aiQuizService.generateQuizQuestions(created.id, {
        topic,
        grade,
        numQuestions,
      });

      // 3. Save questions (backend expects: text, type, points, explanation, options[{text, correct}])
      await contentService.createOrUpdateQuiz(created.id, {
        timeLimitSec: 1800,
        shuffleQuestions: true,
        questions: generatedQuestions.map((gq: any) => ({
          text: gq.text,
          type: gq.type,
          points: gq.points || 10,
          explanation: gq.explanation || '',
          options: gq.options.map((opt: any) => ({
            text: opt.text,
            correct: opt.correct,
          })),
        })),
      });

      alert(`✨ Đã tạo quiz với ${generatedQuestions.length} câu hỏi bằng AI!`);
      await loadQuizzes();
    } catch (error: any) {
      console.error('Error creating quiz with AI:', error);
      alert(error.message || 'Có lỗi khi tạo quiz bằng AI');
      throw error;
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleDuplicateQuiz = async (quiz: Quiz) => {
    try {
      // Create duplicate
      const contentData = {
        title: `${quiz.title} (Bản sao)`,
        description: quiz.description,
        type: 'QUIZ' as const,
        content: JSON.stringify({
          timeLimitSec: quiz.timeLimitSec,
          shuffleQuestions: quiz.shuffleQuestions,
        }),
        classroomId: classroomId,
        isPublic: false,
      };

      const created = await contentService.createContentItem(contentData);
      
      // Copy quiz structure
      try {
        const originalQuiz = await contentService.getQuizByContentId(quiz.id);
        await contentService.createOrUpdateQuiz(created.id, {
          timeLimitSec: quiz.timeLimitSec,
          shuffleQuestions: quiz.shuffleQuestions,
          questions: originalQuiz.questions || [],
        });
      } catch (error) {
        console.error('Error copying quiz questions:', error);
      }

      await loadQuizzes();
      alert('Sao chép quiz thành công!');
    } catch (error: any) {
      console.error('Error duplicating quiz:', error);
      alert('Sao chép quiz thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewResults = (quizId: number) => {
    router.push(`/classroom/${classroomId}/quiz/${quizId}/results`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" /> Đã xuất bản</Badge>;
      case 'draft':
        return <Badge variant="secondary">Bản nháp</Badge>;
      case 'archived':
        return <Badge variant="outline">Đã lưu trữ</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} phút`;
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || quiz.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quiz trắc nghiệm ({quizzes.length})</CardTitle>
            {isTeacher && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateQuiz}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo thủ công
                </Button>
                <Button 
                  onClick={() => setAiModalOpen(true)}
                  disabled={generatingAI}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tạo bằng AI
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search & Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm quiz..."
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
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="archived">Đã lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quizzes List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <FileQuestion className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? 'Không tìm thấy quiz nào' : 'Chưa có quiz nào'}
              </p>
              {isTeacher && !searchQuery && (
                <Button onClick={handleCreateQuiz} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo quiz đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredQuizzes.map((quiz) => (
                <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{quiz.title}</h3>
                          {getStatusBadge(quiz.status)}
                        </div>
                        
                        {quiz.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {quiz.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileQuestion className="w-4 h-4" />
                            <span>{quiz.totalQuestions} câu hỏi</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(quiz.timeLimitSec)}</span>
                          </div>
                          {quiz.totalPoints && (
                            <div className="flex items-center gap-1">
                              <BarChart className="w-4 h-4" />
                              <span>{quiz.totalPoints} điểm</span>
                            </div>
                          )}
                          {quiz.submissionCount !== undefined && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>{quiz.submissionCount} bài nộp</span>
                            </div>
                          )}
                          {quiz.averageScore !== undefined && (
                            <div className="flex items-center gap-1 font-semibold text-primary">
                              ĐTB: {quiz.averageScore.toFixed(1)}/10
                            </div>
                          )}
                        </div>
                      </div>

                      {isTeacher && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageQuestions(quiz.id)}
                            title="Quản lý câu hỏi"
                          >
                            <FileQuestion className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResults(quiz.id)}
                            title="Xem kết quả"
                          >
                            <BarChart className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicateQuiz(quiz)}
                            title="Sao chép"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditQuiz(quiz)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="text-destructive hover:text-destructive"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      {!isTeacher && (
                        <Button
                          onClick={() => router.push(`/classroom/${classroomId}/quiz/${quiz.id}`)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Làm bài
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Quiz Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuiz ? 'Chỉnh sửa quiz' : 'Tạo quiz mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề *</label>
              <Input
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                placeholder="Nhập tiêu đề quiz"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea
                value={quizForm.description}
                onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                placeholder="Mô tả nội dung quiz"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Thời gian làm bài (phút)</label>
                <Input
                  type="number"
                  value={Math.floor(quizForm.timeLimitSec / 60)}
                  onChange={(e) => setQuizForm({ ...quizForm, timeLimitSec: parseInt(e.target.value) * 60 })}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hạn nộp</label>
                <Input
                  type="datetime-local"
                  value={quizForm.dueDate}
                  onChange={(e) => setQuizForm({ ...quizForm, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="shuffleQuestions"
                  checked={quizForm.shuffleQuestions}
                  onChange={(e) => setQuizForm({ ...quizForm, shuffleQuestions: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="shuffleQuestions" className="text-sm">
                  Xáo trộn thứ tự câu hỏi
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={quizForm.isPublic}
                  onChange={(e) => setQuizForm({ ...quizForm, isPublic: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isPublic" className="text-sm">
                  Công khai cho lớp học khác
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveQuiz} disabled={!quizForm.title}>
              {editingQuiz ? 'Cập nhật' : 'Tạo quiz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Builder - Modern Question Management */}
      {questionBuilderOpen && currentQuizId && (
        <QuizBuilder
          quizId={currentQuizId}
          onClose={() => {
            setQuestionBuilderOpen(false);
            setCurrentQuizId(null);
          }}
          onSave={() => {
            setQuestionBuilderOpen(false);
            setCurrentQuizId(null);
            loadQuizzes(); // Reload to update question counts
          }}
        />
      )}

      {/* AI Quiz Generator Modal */}
      <AiQuizGeneratorModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onGenerate={handleCreateWithAI}
      />
    </div>
  );
}
