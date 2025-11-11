'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Play, Clock, CheckCircle, AlertCircle, 
  HelpCircle, ArrowRight, Award, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  points: number;
  options?: { id: number; optionText: string; isCorrect?: boolean }[];
  correctAnswer?: string;
}

interface QuizDetails {
  id: number;
  title: string;
  description?: string;
  timeLimitSec: number;
  questions: QuizQuestion[];
  totalPoints: number;
  passingScore?: number;
}

interface QuizAttempt {
  id: number;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  answers?: Record<number, string>;
  feedback?: string;
  isPassed?: boolean;
}

interface QuizAttemptPlayerProps {
  classroomContentId: number;
  quizDetails: QuizDetails;
  existingAttempts?: QuizAttempt[];
  maxAttempts?: number;
  onAttemptComplete?: () => void;
}

export function QuizAttemptPlayer({
  classroomContentId,
  quizDetails,
  existingAttempts = [],
  maxAttempts = 3,
  onAttemptComplete
}: QuizAttemptPlayerProps) {
  const { id: userId } = useAuth();
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeAttempt = existingAttempts.find(a => !a.submittedAt);
  const completedAttempts = existingAttempts.filter(a => a.submittedAt);
  const attemptsRemaining = maxAttempts - completedAttempts.length;
  const canStartNewAttempt = !activeAttempt && attemptsRemaining > 0;
  const bestScore = Math.max(...completedAttempts.map(a => a.score || 0), 0);

  // Timer effect
  useEffect(() => {
    if (currentAttempt && !currentAttempt.submittedAt && quizDetails.timeLimitSec > 0) {
      const elapsed = (Date.now() - new Date(currentAttempt.startedAt).getTime()) / 1000;
      const remaining = Math.max(0, quizDetails.timeLimitSec - elapsed);
      setTimeRemaining(remaining);

      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentAttempt]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = async () => {
    try {
      setError(null);
      
      // TODO: Call API to create attempt
      // const attempt = await classroomService.startQuizAttempt(classroomContentId);
      
      const mockAttempt: QuizAttempt = {
        id: Date.now(),
        startedAt: new Date().toISOString()
      };

      setCurrentAttempt(mockAttempt);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setShowResults(false);
    } catch (err: any) {
      setError('Không thể bắt đầu quiz: ' + err.message);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizDetails.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAutoSubmit = () => {
    if (!currentAttempt || currentAttempt.submittedAt) return;
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    if (!currentAttempt) return;

    // Check if all questions answered
    const unansweredCount = quizDetails.questions.filter(
      q => !answers[q.id] || answers[q.id].trim() === ''
    ).length;

    if (unansweredCount > 0) {
      if (!confirm(`Bạn còn ${unansweredCount} câu chưa trả lời. Xác nhận nộp bài?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      // TODO: Call API to submit
      // const result = await classroomService.submitQuizAttempt(currentAttempt.id, answers);

      console.log('Submitting quiz:', {
        attemptId: currentAttempt.id,
        answers,
        userId
      });

      // Mock result
      const mockResult: QuizAttempt = {
        ...currentAttempt,
        submittedAt: new Date().toISOString(),
        score: Math.floor(Math.random() * quizDetails.totalPoints),
        answers
      };

      setCurrentAttempt(mockResult);
      setShowResults(true);
      onAttemptComplete?.();
    } catch (err: any) {
      setError('Nộp bài thất bại: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Not started state
  if (!currentAttempt) {
    return (
      <div className="space-y-4">
        {/* Quiz info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              {quizDetails.title}
            </CardTitle>
            {quizDetails.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {quizDetails.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quiz stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{quizDetails.questions.length}</p>
                <p className="text-xs text-muted-foreground">Câu hỏi</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{quizDetails.totalPoints}</p>
                <p className="text-xs text-muted-foreground">Điểm tối đa</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {Math.floor(quizDetails.timeLimitSec / 60)}
                </p>
                <p className="text-xs text-muted-foreground">Phút</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{attemptsRemaining}</p>
                <p className="text-xs text-muted-foreground">Lượt còn lại</p>
              </div>
            </div>

            {/* Previous attempts */}
            {completedAttempts.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground">
                  Lần làm trước ({completedAttempts.length}/{maxAttempts})
                </Label>
                <div className="mt-2 space-y-2">
                  {completedAttempts.map((attempt, idx) => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="text-sm">
                        <span className="font-medium">Lần {idx + 1}</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(attempt.submittedAt!).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <Badge variant={attempt.isPassed ? 'default' : 'secondary'}>
                        {attempt.score}/{quizDetails.totalPoints}
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium mt-2">
                  Điểm cao nhất: {bestScore}/{quizDetails.totalPoints}
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Start button */}
            <Button
              onClick={handleStartQuiz}
              disabled={!canStartNewAttempt}
              className="w-full"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              {canStartNewAttempt 
                ? 'Bắt đầu làm quiz' 
                : attemptsRemaining === 0 
                  ? 'Đã hết lượt làm' 
                  : 'Đang có lượt làm chưa hoàn thành'}
            </Button>

            {quizDetails.passingScore && (
              <p className="text-xs text-center text-muted-foreground">
                Điểm đạt: {quizDetails.passingScore}/{quizDetails.totalPoints}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Taking quiz state
  if (!showResults) {
    const currentQuestion = quizDetails.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizDetails.questions.length) * 100;
    const answeredCount = Object.keys(answers).filter(
      qId => answers[parseInt(qId)]?.trim() !== ''
    ).length;

    return (
      <div className="space-y-4">
        {/* Timer */}
        {timeRemaining !== null && (
          <Alert 
            variant={timeRemaining < 60 ? 'destructive' : 'default'}
            className="border-2"
          >
            <Clock className="w-4 h-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className="font-semibold">Thời gian còn lại:</span>
              <span className="text-2xl font-bold tabular-nums">
                {formatTime(timeRemaining)}
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Câu {currentQuestionIndex + 1}/{quizDetails.questions.length}</span>
                <span className="text-muted-foreground">
                  Đã trả lời: {answeredCount}/{quizDetails.questions.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Question card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-lg flex-1">
                {currentQuestion.questionText}
              </CardTitle>
              <Badge variant="secondary">{currentQuestion.points} điểm</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Multiple choice */}
            {currentQuestion.questionType === 'MULTIPLE_CHOICE' && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3 p-3 hover:bg-muted rounded-md transition">
                    <RadioGroupItem value={option.optionText} id={`opt-${option.id}`} />
                    <Label htmlFor={`opt-${option.id}`} className="flex-1 cursor-pointer">
                      {option.optionText}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* True/False */}
            {currentQuestion.questionType === 'TRUE_FALSE' && (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="flex items-center space-x-3 p-3 hover:bg-muted rounded-md transition">
                  <RadioGroupItem value="true" id="tf-true" />
                  <Label htmlFor="tf-true" className="flex-1 cursor-pointer">Đúng</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 hover:bg-muted rounded-md transition">
                  <RadioGroupItem value="false" id="tf-false" />
                  <Label htmlFor="tf-false" className="flex-1 cursor-pointer">Sai</Label>
                </div>
              </RadioGroup>
            )}

            {/* Short answer */}
            {currentQuestion.questionType === 'SHORT_ANSWER' && (
              <Textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                rows={6}
                className="font-mono"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Câu trước
          </Button>

          <div className="text-sm text-center">
            <p className="text-muted-foreground">
              {answers[currentQuestion.id] ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Đã trả lời
                </span>
              ) : (
                <span className="text-amber-600">Chưa trả lời</span>
              )}
            </p>
          </div>

          {currentQuestionIndex < quizDetails.questions.length - 1 ? (
            <Button onClick={handleNextQuestion}>
              Câu tiếp theo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmitQuiz} disabled={submitting} variant="default">
              {submitting ? 'Đang nộp...' : 'Nộp bài'}
            </Button>
          )}
        </div>

        {/* Question navigator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Danh sách câu hỏi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {quizDetails.questions.map((q, idx) => (
                <Button
                  key={q.id}
                  variant={idx === currentQuestionIndex ? 'default' : answers[q.id] ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className="h-10"
                >
                  {idx + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results state
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-500" />
          Kết quả quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score display */}
        <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
          <p className="text-6xl font-bold mb-2">
            {currentAttempt.score}/{quizDetails.totalPoints}
          </p>
          <p className="text-lg text-muted-foreground">
            {currentAttempt.isPassed ? '🎉 Đạt yêu cầu!' : 'Chưa đạt'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Tỷ lệ: {((currentAttempt.score! / quizDetails.totalPoints) * 100).toFixed(1)}%
          </p>
        </div>

        {/* Submission info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Thời gian nộp:</span>
            <span className="font-medium">
              {new Date(currentAttempt.submittedAt!).toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Số câu đã trả lời:</span>
            <span className="font-medium">
              {Object.keys(answers).length}/{quizDetails.questions.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lượt làm còn lại:</span>
            <span className="font-medium">{attemptsRemaining - 1}/{maxAttempts}</span>
          </div>
        </div>

        {/* Feedback */}
        {currentAttempt.feedback && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="whitespace-pre-wrap">
              {currentAttempt.feedback}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {attemptsRemaining > 1 && (
            <Button variant="outline" onClick={() => {
              setCurrentAttempt(null);
              setShowResults(false);
            }} className="flex-1">
              Làm lại
            </Button>
          )}
          <Button variant="default" onClick={onAttemptComplete} className="flex-1">
            Hoàn thành
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
