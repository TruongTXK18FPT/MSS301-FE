'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { contentService, type Submission } from '@/lib/services/content.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save } from 'lucide-react';

export default function SubmissionGradingPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = Number(params.submissionId);

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      // Get assignment ID from params and fetch submissions
      const assignmentId = Number(params.assignmentId);
      const submissions = await contentService.getSubmissions(assignmentId);
      const found = submissions.find((s) => s.id === submissionId);

      if (!found) {
        setError('Submission not found');
        return;
      }

      setSubmission(found);
      setGrade(found.grade || 0);
      setFeedback(found.feedback || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!submission) return;

    try {
      setGrading(true);
      await contentService.gradeSubmission(submissionId, {
        grade,
        feedback: feedback.trim() || undefined,
      });

      alert('Submission graded successfully!');
      router.back();
    } catch (err: any) {
      alert('Failed to grade: ' + err.message);
    } finally {
      setGrading(false);
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

  if (error || !submission) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error || 'Submission not found'}</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Grade Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Student</Label>
                  <p className="text-sm font-medium">{submission.studentName}</p>
                </div>
                <div>
                  <Label>Submitted At</Label>
                  <p className="text-sm">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge
                    variant={
                      submission.status === 'graded'
                        ? 'default'
                        : submission.status === 'late'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {submission.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Submission Content */}
              <div>
                <Label>Student's Answer</Label>
                {submission.content ? (
                  <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="whitespace-pre-wrap">{submission.content}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mt-2">No text submitted</p>
                )}
              </div>

              {/* Attached Files */}
              {submission.fileIds && (
                <div>
                  <Label>Attached Files</Label>
                  <p className="text-sm text-gray-600 mt-2">
                    File IDs: {submission.fileIds}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (Display/download functionality can be added)
                  </p>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Grading</h3>

                {/* Grade Input */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="grade">Grade (Points)</Label>
                    <Input
                      id="grade"
                      type="number"
                      min={0}
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>

                  {/* Feedback */}
                  <div>
                    <Label htmlFor="feedback">Feedback (Optional)</Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback to the student..."
                      rows={6}
                      className="mt-2"
                    />
                  </div>

                  {/* Existing Grade Info */}
                  {submission.grade !== null && submission.grade !== undefined && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <p className="text-sm">
                        <strong>Current Grade:</strong> {submission.grade} points
                      </p>
                      {submission.feedback && (
                        <p className="text-sm mt-2">
                          <strong>Current Feedback:</strong> {submission.feedback}
                        </p>
                      )}
                      {submission.gradedAt && (
                        <p className="text-sm text-gray-600 mt-2">
                          Graded at: {new Date(submission.gradedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleGrade}
                    disabled={grading}
                    className="w-full"
                    size="lg"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {grading ? 'Saving...' : 'Save Grade'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
