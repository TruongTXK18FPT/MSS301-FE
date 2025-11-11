'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  X, Plus, Trash2, Clock, 
  CheckCircle, AlertCircle, Loader2, Sparkles
} from 'lucide-react';
import { contentService, ContentItem, QuizQuestion } from '@/lib/services/content.service';
import MathTextInput from '@/components/classroom/MathTextInput';
import LatexPreview from '@/components/classroom/LatexPreview';
import AiQuizGeneratorModal from '@/components/classroom/AiQuizGeneratorModal';
import { aiQuizService } from '@/services/ai-quiz.service';

interface QuizFormProps {
  quiz?: ContentItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function QuizForm({ quiz, onSuccess, onCancel }: QuizFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'Toán học',
    grade: '9',
    tags: [] as string[],
    isPublic: true,
    timeLimitSec: 1800, // 30 minutes default
    shuffleQuestions: false,
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        subject: quiz.subject,
        grade: quiz.grade,
        tags: quiz.tags || [],
        isPublic: quiz.isPublic,
        timeLimitSec: 1800,
        shuffleQuestions: false,
      });
      // Load existing questions if editing
      loadQuestions(quiz.id);
    }
  }, [quiz]);

  const loadQuestions = async (quizId: number) => {
    try {
      const quizData = await contentService.getQuiz(quizId);
      if (quizData.questions) {
        setQuestions(quizData.questions);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      points: 10,
      orderIndex: questions.length,
      options: [
        { optionText: '', isCorrect: false, orderIndex: 0 },
        { optionText: '', isCorrect: false, orderIndex: 1 },
        { optionText: '', isCorrect: false, orderIndex: 2 },
        { optionText: '', isCorrect: false, orderIndex: 3 },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleGenerateWithAI = async (topic: string, grade: string, numQuestions: number) => {
    try {
      setGeneratingAI(true);
      setAiModalOpen(false);

      // Nếu chưa có quiz, tạo quiz tạm trước
      let quizId = quiz?.id;
      if (!quizId) {
        // Validate required fields
        if (!formData.title.trim()) {
          alert('Vui lòng nhập tiêu đề quiz trước');
          setGeneratingAI(false);
          return;
        }

        // Create quiz first
        const newQuiz = await contentService.createContentItem({
          title: formData.title,
          description: formData.description || 'Quiz được tạo bằng AI',
          type: 'QUIZ',
          subject: formData.subject,
          grade: formData.grade,
          tags: formData.tags,
          isPublic: formData.isPublic,
        });
        
        quizId = newQuiz.id;
        alert('Quiz đã được tạo! Đang tạo câu hỏi bằng AI...');
      }

      const generatedQuestions = await aiQuizService.generateQuizQuestions(quizId, {
        topic,
        grade,
        numQuestions
      });

      // Convert to QuizQuestion format and add to current questions
      const newQuestions: QuizQuestion[] = generatedQuestions.map((q: any, idx: number) => ({
        questionText: q.text || q.questionText,  // Backend returns 'text'
        questionType: q.type || 'MULTIPLE_CHOICE' as const,
        points: q.points || 10,
        orderIndex: questions.length + idx,
        options: q.options?.map((opt: any, optIdx: number) => ({
          optionText: opt.text || opt.optionText,  // Backend returns 'text'
          isCorrect: opt.correct || opt.isCorrect || false,  // Backend returns 'correct', not 'isCorrect'
          orderIndex: optIdx
        })) || []
      }));

      setQuestions([...questions, ...newQuestions]);
      alert(`✨ Đã tạo ${generatedQuestions.length} câu hỏi bằng AI! Nhấn "Tạo Quiz" bên dưới để lưu.`);
      
      // Don't reload immediately - let user save manually
      // This avoids 500 error from reloading before DB commit
    } catch (error: any) {
      console.error('Error generating with AI:', error);
      alert(error.message || 'Không thể tạo câu hỏi bằng AI');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const updated = [...questions];
    if (!updated[questionIndex].options) return;
    
    updated[questionIndex].options![optionIndex] = {
      ...updated[questionIndex].options![optionIndex],
      [field]: value
    };
    setQuestions(updated);
  };

  const handleSetCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (!updated[questionIndex].options) return;
    
    // Set all to false first
    updated[questionIndex].options!.forEach(opt => opt.isCorrect = false);
    // Set selected to true
    updated[questionIndex].options![optionIndex].isCorrect = true;
    setQuestions(updated);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag.trim()] });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề quiz');
      return;
    }

    if (questions.length === 0) {
      alert('Vui lòng thêm ít nhất 1 câu hỏi');
      return;
    }

    // Validate all questions have text and at least one correct answer
    for (let i = 0; i < questions.length; i++) {
      // @ts-ignore - Backend uses 'text', frontend uses 'questionText'
      const questionText = questions[i].questionText || questions[i].text || '';
      if (!questionText.trim()) {
        alert(`Câu hỏi ${i + 1} chưa có nội dung`);
        return;
      }

      // @ts-ignore - Backend uses 'type', frontend uses 'questionType'
      if (questions[i].questionType === 'MULTIPLE_CHOICE' || questions[i].type === 'MULTIPLE_CHOICE') {
        const hasCorrect = questions[i].options?.some(opt => opt.isCorrect);
        if (!hasCorrect) {
          alert(`Câu hỏi ${i + 1} chưa có đáp án đúng`);
          return;
        }

        const hasEmptyOption = questions[i].options?.some(opt => {
          // @ts-ignore - Backend uses 'text', frontend uses 'optionText'
          const text = opt.optionText || opt.text || '';
          return !text.trim();
        });
        if (hasEmptyOption) {
          alert(`Câu hỏi ${i + 1} có đáp án trống`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      // Map questions to backend format (text/type/correct instead of questionText/questionType/isCorrect)
      const mappedQuestions = questions.map((q: any, idx) => ({
        text: q.questionText || q.text,
        type: q.questionType || q.type,
        points: q.points || 10,
        options: q.options?.map((opt: any, optIdx: number) => ({
          text: opt.optionText || opt.text,
          correct: opt.isCorrect || opt.correct || false,  // Backend uses 'correct'
        }))
      }));

      if (quiz) {
        // Update existing quiz
        await contentService.updateContentItem(quiz.id, {
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          grade: formData.grade,
          tags: formData.tags,
          isPublic: formData.isPublic,
        });

        await contentService.createOrUpdateQuiz(quiz.id, {
          timeLimitSec: formData.timeLimitSec,
          shuffleQuestions: formData.shuffleQuestions,
          // @ts-ignore - Backend format uses 'text'/'type', not 'questionText'/'questionType'
          questions: mappedQuestions,
        });
      } else {
        // Create new quiz
        await contentService.createQuiz({
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          grade: formData.grade,
          tags: formData.tags,
          isPublic: formData.isPublic,
          timeLimitSec: formData.timeLimitSec,
          shuffleQuestions: formData.shuffleQuestions,
          // @ts-ignore - Backend format uses 'text'/'type', not 'questionText'/'questionType'
          questions: mappedQuestions,
        });
      }

      alert('✅ Lưu quiz thành công!');
      onSuccess(); // Reload quiz list
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('❌ Có lỗi khi lưu quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-indigo-950 to-purple-950 border-purple-500/30">
        <CardHeader className="border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-white">
              {quiz ? 'Chỉnh sửa Quiz' : 'Tạo Quiz Mới'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2">Tiêu đề Quiz *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="VD: Phương trình bậc hai"
                className="bg-black/30 border-purple-400/30 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2">Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn về quiz này..."
                className="bg-black/30 border-purple-400/30 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white mb-2">Môn học</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-black/30 border-purple-400/30 text-white"
                />
              </div>

              <div>
                <Label className="text-white mb-2">Lớp</Label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-black/30 border border-purple-400/30 text-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Thời gian (giây)
                </Label>
                <Input
                  type="number"
                  value={formData.timeLimitSec}
                  onChange={(e) => setFormData({ ...formData, timeLimitSec: parseInt(e.target.value) })}
                  className="bg-black/30 border-purple-400/30 text-white"
                />
              </div>

              <div>
                <Label className="text-white mb-2">Trạng thái</Label>
                <select
                  value={formData.isPublic ? 'public' : 'private'}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === 'public' })}
                  className="w-full px-3 py-2 rounded-md bg-black/30 border border-purple-400/30 text-white"
                >
                  <option value="public">Công khai</option>
                  <option value="private">Riêng tư</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label className="text-white mb-2">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Thêm tag..."
                  className="bg-black/30 border-purple-400/30 text-white"
                />
                <Button onClick={handleAddTag} size="sm" className="bg-purple-500">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <Badge key={idx} className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                    {tag}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="border-t border-purple-500/30 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                Câu hỏi ({questions.length})
              </h3>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddQuestion} 
                  variant="outline"
                  className="bg-cyan-500/20 border-cyan-400/30 text-cyan-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm thủ công
                </Button>
                <Button 
                  onClick={() => setAiModalOpen(true)}
                  disabled={generatingAI || !formData.title.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!formData.title.trim() ? 'Nhập tiêu đề quiz trước' : 'Tạo câu hỏi tự động bằng AI'}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {generatingAI ? 'Đang tạo...' : 'Tạo bằng AI'}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((question, qIdx) => (
                <Card key={qIdx} className="bg-black/40 border-purple-500/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <Label className="text-white font-semibold">Câu {qIdx + 1}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <MathTextInput
                      value={question.questionText}
                      onChange={(value) => handleQuestionChange(qIdx, 'questionText', value)}
                      placeholder="Nhập câu hỏi (hỗ trợ LaTeX: $x^2$ hoặc $$\\frac{a}{b}$$)..."
                      rows={3}
                      allowImage={true}
                      folder="quiz-questions"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-white text-sm">Điểm</Label>
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) => handleQuestionChange(qIdx, 'points', parseInt(e.target.value))}
                          className="bg-black/30 border-purple-400/30 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Loại</Label>
                        <select
                          value={question.questionType}
                          onChange={(e) => handleQuestionChange(qIdx, 'questionType', e.target.value)}
                          className="w-full px-3 py-2 rounded-md bg-black/30 border border-purple-400/30 text-white"
                        >
                          <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                          <option value="TRUE_FALSE">Đúng/Sai</option>
                          <option value="SHORT_ANSWER">Tự luận</option>
                        </select>
                      </div>
                    </div>

                    {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                      <div className="space-y-2">
                        <Label className="text-white text-sm">Đáp án</Label>
                        {question.options.map((option, oIdx) => (
                          <div key={oIdx} className="space-y-2">
                            <div className="flex items-start gap-2">
                              <Button
                                size="sm"
                                variant={option.isCorrect ? 'default' : 'outline'}
                                onClick={() => handleSetCorrectAnswer(qIdx, oIdx)}
                                className={`mt-2 ${option.isCorrect 
                                  ? 'bg-green-500 hover:bg-green-600' 
                                  : 'bg-black/30 border-purple-400/30'
                                }`}
                              >
                                {option.isCorrect ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                              </Button>
                              <div className="flex-1">
                                <MathTextInput
                                  value={option.optionText}
                                  onChange={(value) => handleOptionChange(qIdx, oIdx, 'optionText', value)}
                                  placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)} (hỗ trợ LaTeX)...`}
                                  rows={2}
                                  allowImage={true}
                                  folder="quiz-options"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-purple-500/30">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang lưu...</>
              ) : (
                quiz ? 'Cập nhật Quiz' : 'Tạo Quiz'
              )}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="bg-black/30 border-purple-400/30 text-white"
            >
              Hủy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Quiz Generator Modal */}
      <AiQuizGeneratorModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onGenerate={handleGenerateWithAI}
      />
    </div>
  );
}
