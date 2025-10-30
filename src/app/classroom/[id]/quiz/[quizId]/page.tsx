'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  contentService,
  type ContentItem,
  type Quiz,
  type QuizQuestion,
  type QuizAttempt,
} from '@/lib/services/content.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  CheckCircle,
  Play,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id: userId, role } = useAuth();
  const quizId = Number(params.quizId);

  const [quiz, setQuiz] = useState<ContentItem | null>(null);
  const [quizDetails, setQuizDetails] = useState<Quiz | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [myAttempts, setMyAttempts] = useState<QuizAttempt[]>([]);
  const [allAttempts, setAllAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz taking state
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isTeacher = role === 'TEACHER' || (quiz && Number(userId) === quiz.ownerId);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (currentAttempt && quizDetails && !currentAttempt.submittedAt) {
      // Start timer
      const elapsed =
        (new Date().getTime() - new Date(currentAttempt.startedAt).getTime()) / 1000;
      const remaining = Math.max(0, quizDetails.timeLimitSec - elapsed);
      setTimeRemaining(remaining);

      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            handleSubmit(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentAttempt, quizDetails]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const [contentItem, details] = await Promise.all([
        contentService.getContentItemById(quizId),
        contentService.getQuiz(quizId),
      ]);

      if (contentItem.type !== 'QUIZ') {
        setError('This is not a quiz');
        return;
      }

      setQuiz(contentItem);
      setQuizDetails(details);

      // Load attempts
      if (Number(userId) === contentItem.ownerId) {
        // Teacher: load all attempts
        const attempts = await contentService.getQuizAttempts(quizId);
        setAllAttempts(attempts);
      } else {
        // Student: load my attempts
        const attempts = await contentService.getMyQuizAttempts(quizId);
        setMyAttempts(attempts);

        // Check for active attempt
        const active = attempts.find((a) => !a.submittedAt);
        if (active) {
          setCurrentAttempt(active);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      const attempt = await contentService.startQuizAttempt(quizId);
      setCurrentAttempt(attempt);
      setAnswers({});
    } catch (err: any) {
      alert('Failed to start quiz: ' + err.message);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleSubmit = async () => {
    if (!currentAttempt) return;

    try {
      setSubmitting(true);
      await contentService.submitQuizAttempt(currentAttempt.id, answers);
      alert('Quiz submitted successfully!');
      loadQuiz();
    } catch (err: any) {
      alert('Failed to submit quiz: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !quiz || !quizDetails) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error || 'Quiz not found'}</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalPoints = quizDetails.questions?.reduce((sum, q) => sum + q.points, 0) || 0;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                  <Badge variant="outline">Quiz</Badge>
                  <Badge variant="secondary">{totalPoints} points</Badge>
                </div>
                <CardTitle className="text-3xl mb-2">{quiz.title}</CardTitle>
                {quiz.description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {quiz.description}
                  </p>
                )}
              </div>
            </div>

            {/* Quiz Info */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  Time Limit: {Math.floor(quizDetails.timeLimitSec / 60)} minutes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>{quizDetails.questions?.length || 0} questions</span>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Timer (when taking quiz) */}
      {currentAttempt && !currentAttempt.submittedAt && timeRemaining !== null && (
        <Card className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Time Remaining:</span>
              <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Content */}
      {!isTeacher && !currentAttempt && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Start?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This quiz has {quizDetails.questions?.length} questions and a time limit
              of {Math.floor(quizDetails.timeLimitSec / 60)} minutes.
            </p>
            {myAttempts.length > 0 && (
              <div className="mb-4">
                <Label>Your Previous Attempts:</Label>
                <ul className="list-disc list-inside text-sm mt-2">
                  {myAttempts.map((attempt) => (
                    <li key={attempt.id}>
                      {new Date(attempt.startedAt).toLocaleString()} - Score:{' '}
                      {attempt.score || 'Not graded'}/{totalPoints}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button onClick={handleStartQuiz} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Taking Quiz */}
      {currentAttempt && !currentAttempt.submittedAt && quizDetails.questions && (
        <div className="space-y-6">
          {quizDetails.questions.map((question, index) => (
            <Card key={question.id || index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {index + 1}. {question.questionText}
                  </CardTitle>
                  <Badge variant="secondary">{question.points} pts</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                  <RadioGroup
                    value={answers[question.id!] || ''}
                    onValueChange={(value) => handleAnswerChange(question.id!, value)}
                  >
                    {question.options.map((option, optIdx) => (
                      <div key={option.id || optIdx} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.optionText} id={`q${question.id}-opt${optIdx}`} />
                        <Label htmlFor={`q${question.id}-opt${optIdx}`}>{option.optionText}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.questionType === 'TRUE_FALSE' && (
                  <RadioGroup
                    value={answers[question.id!] || ''}
                    onValueChange={(value) => handleAnswerChange(question.id!, value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id={`q${question.id}-true`} />
                      <Label htmlFor={`q${question.id}-true`}>True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id={`q${question.id}-false`} />
                      <Label htmlFor={`q${question.id}-false`}>False</Label>
                    </div>
                  </RadioGroup>
                )}

                {question.questionType === 'SHORT_ANSWER' && (
                  <Textarea
                    value={answers[question.id!] || ''}
                    onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                  />
                )}
              </CardContent>
            </Card>
          ))}

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </div>
      )}

      {/* Completed Attempt */}
      {currentAttempt && currentAttempt.submittedAt && !isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Submitted:</strong>{' '}
                {new Date(currentAttempt.submittedAt).toLocaleString()}
              </p>
              <p>
                <strong>Score:</strong> {currentAttempt.score || 'Pending'}/{totalPoints}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teacher View: All Attempts */}
      {isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>All Attempts ({allAttempts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {allAttempts.length === 0 ? (
              <p className="text-gray-600">No attempts yet</p>
            ) : (
              <div className="space-y-2">
                {allAttempts.map((attempt) => (
                  <Card key={attempt.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{attempt.studentName}</p>
                        <p className="text-sm text-gray-600">
                          Started: {new Date(attempt.startedAt).toLocaleString()}
                        </p>
                        {attempt.submittedAt && (
                          <p className="text-sm text-gray-600">
                            Submitted: {new Date(attempt.submittedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Badge variant={attempt.submittedAt ? 'default' : 'secondary'}>
                        {attempt.submittedAt
                          ? `${attempt.score}/${totalPoints}`
                          : 'In Progress'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
