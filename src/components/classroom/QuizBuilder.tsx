'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Trash2, GripVertical, Check, X,
  FileQuestion, Award, Clock, AlertCircle, Loader2, Sparkles
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { quizService, QuizQuestionRequest } from '@/services/quiz.service';
import { aiQuizService } from '@/services/ai-quiz.service';
import MathTextInput from './MathTextInput';
import LatexPreview from './LatexPreview';
import AiQuizGeneratorModal from './AiQuizGeneratorModal';
import { useToast } from '@/hooks/use-toast';

interface QuizBuilderProps {
  quizId: number;
  onClose: () => void;
  onSave: () => void;
}

interface QuizQuestion {
  id?: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  points: number;
  explanation?: string;
  options: QuizOption[];
  orderIndex?: number;
  isSaving?: boolean;  // Track individual question save state
}

interface QuizOption {
  id?: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex?: number;
}

export default function QuizBuilder({ quizId, onClose, onSave }: QuizBuilderProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState<'overview' | 'questions'>('overview');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const { toast } = useToast();

  // Load existing questions on mount
  useEffect(() => {
    loadQuestions();
  }, [quizId]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await quizService.getQuestions(quizId);
      
      // Handle empty response or null
      if (!data || !Array.isArray(data)) {
        setQuestions([]);
        return;
      }
      
      setQuestions(data.map(q => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        points: q.points,
        explanation: q.explanation,
        options: (q.options || []).map(o => ({
          id: o.id,
          optionText: o.optionText,
          isCorrect: o.isCorrect,
          orderIndex: o.orderIndex,
        })),
        orderIndex: q.orderIndex,
      })));
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions([]); // Set empty array on error
      toast({
        title: 'Lỗi',
        description: 'Không thể tải câu hỏi',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      points: 1,
      options: [
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options.push({
      optionText: '',
      isCorrect: false,
    });
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: keyof QuizOption, value: any) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = {
      ...updated[questionIndex].options[optionIndex],
      [field]: value,
    };
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updated);
  };

  const removeQuestion = async (index: number) => {
    const question = questions[index];
    
    // If question has an ID, delete from backend
    if (question.id) {
      try {
        await quizService.deleteQuestion(quizId, question.id);
        toast({
          title: 'Thành công',
          description: 'Đã xóa câu hỏi thành công'
        });
      } catch (error) {
        console.error('Error deleting question:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể xóa câu hỏi',
          variant: 'destructive'
        });
        return;
      }
    }
    
    // Remove from local state
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare requests
      const requests: QuizQuestionRequest[] = questions.map((q, index) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        points: q.points,
        explanation: q.explanation,
        options: q.options.map((o, oIndex) => ({
          optionText: o.optionText,
          isCorrect: o.isCorrect,
          orderIndex: oIndex,
        })),
        orderIndex: index,
      }));

      // Use batch add if questions don't have IDs (new questions)
      const newQuestions = requests.filter((_, index) => !questions[index].id);
      if (newQuestions.length > 0) {
        await quizService.addQuestions(quizId, newQuestions);
      }

      // Update existing questions
      const updatePromises = questions
        .filter(q => q.id)
        .map((q, index) => 
          quizService.updateQuestion(quizId, q.id!, requests[index])
        );
      
      await Promise.all(updatePromises);

      toast({
        title: 'Thành công',
        description: 'Đã lưu câu hỏi thành công!'
      });
      onSave();
    } catch (error) {
      console.error('Error saving questions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu câu hỏi',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAiGenerate = async (topic: string, grade: string, numQuestions: number) => {
    try {
      toast({
        title: 'Đang tạo câu hỏi...',
        description: 'AI đang tạo câu hỏi cho bạn. Vui lòng đợi...',
      });

      const generatedQuestions = await aiQuizService.generateQuizQuestions(quizId, {
        topic,
        grade,
        numQuestions,
      });

      // Convert to QuizQuestion format
      const newQuestions: QuizQuestion[] = generatedQuestions.map(gq => ({
        questionText: gq.text,
        questionType: 'MULTIPLE_CHOICE',
        points: gq.points || 10,
        options: gq.options.map(opt => ({
          optionText: opt.text,
          isCorrect: opt.correct,
        })),
      }));

      // Add to existing questions
      setQuestions([...questions, ...newQuestions]);

      toast({
        title: 'Thành công!',
        description: `Đã tạo ${newQuestions.length} câu hỏi mới`,
      });
    } catch (error: any) {
      console.error('Error generating questions:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tạo câu hỏi bằng AI',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <FileQuestion className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Tạo Bài Quiz</h2>
                <p className="text-purple-200 text-sm">Tạo và quản lý câu hỏi quiz</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress */}
          <div className="mt-6 flex gap-2">
            <Button
              variant={currentStep === 'overview' ? 'default' : 'outline'}
              onClick={() => setCurrentStep('overview')}
              className="flex-1"
            >
              <FileQuestion className="w-4 h-4 mr-2" />
              Tổng Quan
            </Button>
            <Button
              variant={currentStep === 'questions' ? 'default' : 'outline'}
              onClick={() => setCurrentStep('questions')}
              className="flex-1"
            >
              <Award className="w-4 h-4 mr-2" />
              Câu Hỏi ({questions.length})
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <span className="ml-3 text-purple-300">Đang tải câu hỏi...</span>
            </div>
          ) : (
            <>
              {currentStep === 'overview' && (
                <div className="space-y-6">
                  <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    Tóm Tắt Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                      <div className="text-purple-300 text-sm mb-1">Tổng Số Câu Hỏi</div>
                      <div className="text-3xl font-bold text-white">{questions.length}</div>
                    </div>
                    <div className="bg-pink-500/10 rounded-xl p-4 border border-pink-500/20">
                      <div className="text-pink-300 text-sm mb-1">Tổng Điểm</div>
                      <div className="text-3xl font-bold text-white">
                        {questions.reduce((sum, q) => sum + q.points, 0)}
                      </div>
                    </div>
                    <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                      <div className="text-blue-300 text-sm mb-1">Điểm Trung Bình</div>
                      <div className="text-3xl font-bold text-white">
                        {questions.length > 0
                          ? (questions.reduce((sum, q) => sum + q.points, 0) / questions.length).toFixed(1)
                          : 0}
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-300 font-semibold mb-1">Mẹo Nhanh</h4>
                      <ul className="text-yellow-200/80 text-sm space-y-1">
                        <li>• Kết hợp nhiều loại câu hỏi để tăng tính tương tác</li>
                        <li>• Mỗi câu hỏi phải có ít nhất một đáp án đúng</li>
                        <li>• Thêm giải thích để giúp học sinh học tốt hơn</li>
                        <li>• Phân bổ điểm dựa trên độ khó</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        if (questions.length === 0) addQuestion();
                        setCurrentStep('questions');
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      {questions.length === 0 ? 'Thêm Câu Hỏi Đầu Tiên' : 'Tiếp Tục Đến Câu Hỏi'}
                    </Button>
                    <Button
                      onClick={() => setAiModalOpen(true)}
                      variant="outline"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Tạo Bằng AI
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 'questions' && (
                <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <Card
                  key={qIndex}
                  className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 border-purple-500/30"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                        <span>Câu Hỏi {qIndex + 1}</span>
                        <Badge variant="outline" className="ml-2">
                          {question.points} điểm
                        </Badge>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Question Text with Math and Image support */}
                    <MathTextInput
                      label="Nội Dung Câu Hỏi"
                      value={question.questionText}
                      onChange={(value) => updateQuestion(qIndex, 'questionText', value)}
                      placeholder="Nhập câu hỏi (hỗ trợ text, $công thức$, $$công thức block$$, và ![hình ảnh])"
                      rows={4}
                      allowImage={true}
                      folder="quiz-questions"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      {/* Question Type */}
                      <div>
                        <label className="text-purple-200 text-sm mb-2 block">Loại Câu Hỏi</label>
                        <Select
                          value={question.questionType}
                          onValueChange={(value) => updateQuestion(qIndex, 'questionType', value)}
                        >
                          <SelectTrigger className="bg-black/40 border-purple-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MULTIPLE_CHOICE">Trắc Nghiệm</SelectItem>
                            <SelectItem value="TRUE_FALSE">Đúng/Sai</SelectItem>
                            <SelectItem value="SHORT_ANSWER">Câu Trả Lời Ngắn</SelectItem>
                            <SelectItem value="ESSAY">Tự Luận</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Points */}
                      <div>
                        <label className="text-purple-200 text-sm mb-2 block">Điểm</label>
                        <Input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                          className="bg-black/40 border-purple-500/30 text-white"
                        />
                      </div>
                    </div>

                    {/* Options */}
                    {(question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'TRUE_FALSE') && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-purple-200 text-sm">Các Đáp Án</label>
                          {question.questionType === 'MULTIPLE_CHOICE' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addOption(qIndex)}
                              className="border-purple-500/30 text-purple-300"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Thêm Đáp Án
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="space-y-2 p-3 bg-black/20 rounded-lg border border-purple-500/20">
                              <div className="flex gap-2 items-start">
                                <Button
                                  variant={option.isCorrect ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => {
                                    // For multiple choice, allow multiple correct answers
                                    updateOption(qIndex, oIndex, 'isCorrect', !option.isCorrect);
                                  }}
                                  className={
                                    option.isCorrect
                                      ? 'bg-green-600 hover:bg-green-700 mt-1'
                                      : 'border-gray-600 hover:bg-gray-800 mt-1'
                                  }
                                >
                                  {option.isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                </Button>
                                <div className="flex-1">
                                  <MathTextInput
                                    value={option.optionText}
                                    onChange={(value) => updateOption(qIndex, oIndex, 'optionText', value)}
                                    placeholder={`Đáp án ${oIndex + 1} (hỗ trợ $công thức$ và hình ảnh)`}
                                    rows={2}
                                    allowImage={true}
                                    folder="quiz-options"
                                  />
                                </div>
                                {question.questionType === 'MULTIPLE_CHOICE' && question.options.length > 2 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(qIndex, oIndex)}
                                    className="text-red-400 hover:text-red-300 mt-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    <div>
                      <label className="text-purple-200 text-sm mb-2 block">
                        Giải Thích (Tùy Chọn)
                      </label>
                      <MathTextInput
                        value={question.explanation || ''}
                        onChange={(value) => updateQuestion(qIndex, 'explanation', value)}
                        placeholder="Giải thích đáp án đúng (hỗ trợ $công thức$ và hình ảnh)..."
                        rows={3}
                        allowImage={true}
                        folder="quiz-explanations"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

                  <Button
                    onClick={addQuestion}
                    variant="outline"
                    className="w-full border-dashed border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Thêm Câu Hỏi Khác
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-t border-purple-500/30 p-6 flex items-center justify-between">
          <div className="text-purple-200 text-sm">
            {questions.length} câu hỏi •{' '}
            {questions.reduce((sum, q) => sum + q.points, 0)} tổng điểm
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || questions.length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {saving ? 'Đang lưu...' : 'Lưu Câu Hỏi'}
            </Button>
          </div>
        </div>
      </div>

      {/* AI Generator Modal */}
      <AiQuizGeneratorModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onGenerate={handleAiGenerate}
      />
    </div>
  );
}
