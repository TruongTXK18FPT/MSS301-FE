'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft, ArrowRight, Clock, Lightbulb, CheckCircle,
  XCircle, Brain, Sparkles, Send, Trophy
} from 'lucide-react';
import { ContentItem, contentService } from '@/lib/services/content.service';
import { generateHint } from '@/ai/flows/ai-powered-hints-practice';
import LatexPreview from '@/components/classroom/LatexPreview';
import MarkdownMessage from '@/components/chat/MarkdownMessage';

// Frontend UI interfaces
interface QuizQuestionUI {
  id?: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  points: number;
  explanation?: string;
  options?: QuizOptionUI[];
}

interface QuizOptionUI {
  id?: number;
  optionText: string;
  isCorrect: boolean;
}

interface QuizPlayerProps {
  quiz: ContentItem;
  onClose: () => void;
}

interface Answer {
  questionId: number;
  selectedOptionId?: number;
  textAnswer?: string;
}

export default function QuizPlayer({ quiz, onClose }: QuizPlayerProps) {
  const [questions, setQuestions] = useState<QuizQuestionUI[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes default
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState('');
  const [loadingHint, setLoadingHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    loadQuiz();
  }, []);

  useEffect(() => {
    if (!submitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, submitted]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const quizData = await contentService.getQuiz(quiz.id);
      
      // Map backend format to UI format
      const mappedQuestions: QuizQuestionUI[] = (quizData.questions || []).map((q: any) => ({
        id: q.id,
        questionText: q.text || q.questionText || '',
        questionType: q.type || q.questionType || 'MULTIPLE_CHOICE',
        points: q.points || 10,
        explanation: q.explanation || '',
        options: (q.options || []).map((opt: any) => ({
          id: opt.id,
          optionText: opt.text || opt.optionText || '',
          isCorrect: opt.correct ?? opt.isCorrect ?? false
        }))
      }));
      
      setQuestions(mappedQuestions);
      
      // Start quiz attempt
      const attempt = await contentService.startQuizAttempt(quiz.id);
      setAttemptId(attempt.id);

      // Initialize answers
      const initialAnswers = mappedQuestions.map((q) => ({
        questionId: q.id || 0,
        selectedOptionId: undefined,
        textAnswer: undefined
      }));
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectOption = (optionId: number) => {
    if (submitted) return;

    setAnswers(prev => prev.map(ans =>
      ans.questionId === (currentQuestion.id || 0)
        ? { ...ans, selectedOptionId: optionId }
        : ans
    ));
  };

  const handleTextAnswer = (text: string) => {
    if (submitted) return;

    setAnswers(prev => prev.map(ans =>
      ans.questionId === (currentQuestion.id || 0)
        ? { ...ans, textAnswer: text }
        : ans
    ));
  };

  const handleGenerateHint = async () => {
    setLoadingHint(true);
    setShowHint(true);
    try {
      const hintResult = await generateHint({
        problem: currentQuestion.questionText,
        studentLevel: parseInt(quiz.grade || '9'),
        topic: quiz.subject || 'Toán học'
      });
      setHint(hintResult.hint);
    } catch (error) {
      console.error('Error generating hint:', error);
      setHint('Xin lỗi, không thể tạo gợi ý lúc này. Vui lòng thử lại sau.');
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!attemptId) return;

    try {
      // Prepare answers array
      const answersArray = answers.map(ans => ({
        questionId: ans.questionId,
        selectedOptionId: ans.selectedOptionId,
        textAnswer: ans.textAnswer
      }));
      
      const result = await contentService.submitQuizAttempt(attemptId, answersArray);
      
      setScore(result.score || 0);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const currentAnswer = answers.find(a => a.questionId === (currentQuestion?.id || 0));
  const isAnswered = currentAnswer?.selectedOptionId || currentAnswer?.textAnswer;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return answers.filter(a => a.selectedOptionId || a.textAnswer).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-200 text-lg">Đang tải quiz...</p>
        </div>
      </div>
    );
  }

  if (submitted && score !== null) {
    const percentage = (score / questions.length) * 100;
    const passed = percentage >= 60;

    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
          <div className="stars absolute inset-0"></div>
          <div className="twinkling absolute inset-0"></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <Card className="max-w-2xl mx-auto bg-black/40 backdrop-blur-xl border-purple-500/30">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-6">
                <div className={`p-4 rounded-full ${passed ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
                  <Trophy className={`h-16 w-16 ${passed ? 'text-green-400' : 'text-orange-400'}`} />
                </div>
              </div>
              <CardTitle className="text-3xl text-white mb-2">
                {passed ? 'Chúc mừng! 🎉' : 'Cố gắng thêm nhé! 💪'}
              </CardTitle>
              <p className="text-purple-200">Bạn đã hoàn thành quiz</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-black/30 rounded-xl p-6 text-center">
                <p className="text-purple-200 mb-2">Điểm của bạn</p>
                <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {score}/{questions.length}
                </p>
                <p className="text-2xl text-purple-300 mt-2">
                  {percentage.toFixed(0)}%
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-xl p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-purple-200">Đúng</p>
                  <p className="text-2xl font-bold text-white">{score}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4 text-center">
                  <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-purple-200">Sai</p>
                  <p className="text-2xl font-bold text-white">{questions.length - score}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Quay lại danh sách
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1 bg-black/30 border-purple-400/30 text-purple-200"
                >
                  Làm lại
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-black/30 border-purple-400/30 text-purple-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Thoát
          </Button>

          <div className="flex items-center gap-4">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              {formatTime(timeLeft)}
            </Badge>
            <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/30 px-4 py-2">
              {getAnsweredCount()}/{questions.length} câu
            </Badge>
          </div>
        </div>

        {/* Quiz Title */}
        <Card className="mb-6 bg-black/40 backdrop-blur-xl border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{quiz.title}</CardTitle>
            {quiz.description && (
              <p className="text-purple-200">{quiz.description}</p>
            )}
          </CardHeader>
        </Card>

        {/* Question */}
        {currentQuestion && (
          <Card className="mb-6 bg-black/40 backdrop-blur-xl border-pink-500/30">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                  Câu {currentQuestionIndex + 1}/{questions.length}
                </Badge>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30">
                  {currentQuestion.points} điểm
                </Badge>
              </div>
              <CardTitle className="text-xl text-white">
                <LatexPreview content={currentQuestion.questionText} />
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Multiple Choice Options */}
              {currentQuestion.questionType === 'MULTIPLE_CHOICE' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={option.id || idx}
                      onClick={() => handleSelectOption(option.id || idx)}
                      disabled={submitted}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        currentAnswer?.selectedOptionId === (option.id || idx)
                          ? 'bg-purple-500/30 border-2 border-purple-400'
                          : 'bg-black/30 border-2 border-purple-400/30 hover:border-purple-400/60'
                      } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          currentAnswer?.selectedOptionId === (option.id || idx)
                            ? 'border-purple-400 bg-purple-500/30'
                            : 'border-purple-400/50'
                        }`}>
                          <span className="text-white font-medium">
                            {String.fromCharCode(65 + idx)}
                          </span>
                        </div>
                        <div className="text-white flex-1">
                          <LatexPreview content={option.optionText} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* True/False */}
              {currentQuestion.questionType === 'TRUE_FALSE' && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSelectOption(1)}
                    disabled={submitted}
                    className={`p-6 rounded-xl transition-all ${
                      currentAnswer?.selectedOptionId === 1
                        ? 'bg-green-500/30 border-2 border-green-400'
                        : 'bg-black/30 border-2 border-green-400/30 hover:border-green-400/60'
                    }`}
                  >
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-white text-center font-medium">Đúng</p>
                  </button>
                  <button
                    onClick={() => handleSelectOption(0)}
                    disabled={submitted}
                    className={`p-6 rounded-xl transition-all ${
                      currentAnswer?.selectedOptionId === 0
                        ? 'bg-red-500/30 border-2 border-red-400'
                        : 'bg-black/30 border-2 border-red-400/30 hover:border-red-400/60'
                    }`}
                  >
                    <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <p className="text-white text-center font-medium">Sai</p>
                  </button>
                </div>
              )}

              {/* Short Answer */}
              {currentQuestion.questionType === 'SHORT_ANSWER' && (
                <textarea
                  value={currentAnswer?.textAnswer || ''}
                  onChange={(e) => handleTextAnswer(e.target.value)}
                  disabled={submitted}
                  placeholder="Nhập câu trả lời của bạn..."
                  className="w-full p-4 rounded-xl bg-black/30 border-2 border-purple-400/30 text-white placeholder:text-purple-200/50 focus:border-purple-400 focus:outline-none min-h-[120px]"
                />
              )}

              {/* AI Hint Button */}
              <Button
                onClick={handleGenerateHint}
                disabled={loadingHint || submitted}
                variant="outline"
                className="w-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/30 text-amber-200 hover:border-amber-400"
              >
                {loadingHint ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400 mr-2"></div>
                    Đang tạo gợi ý...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Xin gợi ý từ AI
                  </>
                )}
              </Button>

              {/* Hint Display */}
              {showHint && hint && (
                <Alert className="bg-amber-500/10 border-amber-400/30">
                  <Brain className="h-4 w-4 text-amber-400" />
                  <AlertDescription className="text-amber-200">
                    <strong className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4" />
                      Gợi ý từ AI:
                    </strong>
                    <div className="text-amber-200">
                      <MarkdownMessage content={hint} className="text-amber-200" />
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="flex-1 bg-black/30 border-purple-400/30 text-purple-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Câu trước
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Câu tiếp
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              disabled={getAnsweredCount() < questions.length}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <Send className="h-4 w-4 mr-2" />
              Nộp bài
            </Button>
          )}
        </div>

        {/* Question Progress */}
        <div className="mt-6">
          <div className="flex gap-2 flex-wrap justify-center">
            {questions.map((_, idx) => {
              const ans = answers[idx];
              const isAnswered = ans?.selectedOptionId || ans?.textAnswer;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all ${
                    idx === currentQuestionIndex
                      ? 'bg-purple-500 text-white scale-110'
                      : isAnswered
                      ? 'bg-green-500/30 text-green-300 border border-green-400/30'
                      : 'bg-black/30 text-purple-300 border border-purple-400/30'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
