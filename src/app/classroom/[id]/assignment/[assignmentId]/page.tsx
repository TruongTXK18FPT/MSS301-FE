'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  contentService,
  type ContentItem,
  type Assignment,
  type Submission,
} from '@/lib/services/content.service';
import { mediaService } from '@/lib/services/media.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Upload,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id: userId, role } = useAuth();
  const assignmentId = Number(params.assignmentId);

  const [assignment, setAssignment] = useState<ContentItem | null>(null);
  const [assignmentDetails, setAssignmentDetails] = useState<Assignment | null>(null);
  const [mySubmission, setMySubmission] = useState<Submission | null>(null);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Submission form
  const [submissionText, setSubmissionText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const isTeacher = role === 'TEACHER' || (assignment && Number(userId) === assignment.ownerId);

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const [contentItem, details] = await Promise.all([
        contentService.getContentItemById(assignmentId),
        contentService.getAssignment(assignmentId),
      ]);

      if (contentItem.type !== 'ASSIGNMENT') {
        setError('This is not an assignment');
        return;
      }

      setAssignment(contentItem);
      setAssignmentDetails(details);

      // Load submissions
      if (Number(userId) === contentItem.ownerId) {
        // Teacher: load all submissions
        const submissions = await contentService.getSubmissions(assignmentId);
        setAllSubmissions(submissions);
      } else {
        // Student: load my submission
        const submissions = await contentService.getSubmissions(assignmentId);
        const mine = submissions.find((s) => s.studentId === Number(userId));
        if (mine) {
          setMySubmission(mine);
          setSubmissionText(mine.content || '');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const uploaded = await mediaService.uploadAssignmentFiles(files);
      setUploadedFiles([...uploadedFiles, ...uploaded]);
    } catch (err: any) {
      alert('Failed to upload files: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!assignmentDetails) return;

    const canSubmitText =
      assignmentDetails.submissionType === 'TEXT' ||
      assignmentDetails.submissionType === 'BOTH';
    const canSubmitFile =
      assignmentDetails.submissionType === 'FILE' ||
      assignmentDetails.submissionType === 'BOTH';

    if (canSubmitText && !submissionText.trim()) {
      alert('Please enter your submission text');
      return;
    }

    if (canSubmitFile && uploadedFiles.length === 0) {
      alert('Please upload at least one file');
      return;
    }

    try {
      setSubmitting(true);
      const fileIds = uploadedFiles.map((f) => f.publicId).join(',');

      await contentService.submitAssignment(assignmentId, {
        content: canSubmitText ? submissionText : undefined,
        fileIds: canSubmitFile ? fileIds : undefined,
      });

      alert('Assignment submitted successfully!');
      loadAssignment();
    } catch (err: any) {
      alert('Failed to submit: ' + err.message);
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

  if (error || !assignment || !assignmentDetails) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error || 'Assignment not found'}</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dueDate = assignment.content
    ? JSON.parse(assignment.content).dueDate
    : null;
  const totalPoints = assignment.content
    ? JSON.parse(assignment.content).totalPoints
    : null;

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
                  <FileText className="h-5 w-5 text-green-600" />
                  <Badge variant="outline">Assignment</Badge>
                  {totalPoints && (
                    <Badge variant="secondary">{totalPoints} points</Badge>
                  )}
                </div>
                <CardTitle className="text-3xl mb-2">{assignment.title}</CardTitle>
                {assignment.description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {assignment.description}
                  </p>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
              {dueDate && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Due: {new Date(dueDate).toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Owner ID: {assignment.ownerId}</span>
              </div>
            </div>

            {/* Submission Status */}
            {!isTeacher && mySubmission && (
              <div className="mt-4">
                <Badge
                  variant={
                    mySubmission.status === 'graded'
                      ? 'default'
                      : mySubmission.status === 'late'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  {mySubmission.status.toUpperCase()}
                  {mySubmission.grade !== null &&
                    mySubmission.grade !== undefined &&
                    ` - Grade: ${mySubmission.grade}/${totalPoints}`}
                </Badge>
              </div>
            )}
          </CardHeader>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            {assignmentDetails.instructions}
          </div>

          {assignmentDetails.attachmentFileIds && (
            <div className="mt-4">
              <Label>Attached Files</Label>
              <p className="text-sm text-gray-600">
                File IDs: {assignmentDetails.attachmentFileIds}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Section (for students) */}
      {!isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>
              {mySubmission ? 'Your Submission' : 'Submit Assignment'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mySubmission ? (
              <div className="space-y-4">
                <div>
                  <Label>Submitted At</Label>
                  <p className="text-sm">
                    {new Date(mySubmission.submittedAt).toLocaleString()}
                  </p>
                </div>

                {mySubmission.content && (
                  <div>
                    <Label>Your Answer</Label>
                    <p className="text-sm whitespace-pre-wrap">
                      {mySubmission.content}
                    </p>
                  </div>
                )}

                {mySubmission.fileIds && (
                  <div>
                    <Label>Uploaded Files</Label>
                    <p className="text-sm text-gray-600">
                      File IDs: {mySubmission.fileIds}
                    </p>
                  </div>
                )}

                {mySubmission.feedback && (
                  <div>
                    <Label>Teacher Feedback</Label>
                    <p className="text-sm whitespace-pre-wrap">
                      {mySubmission.feedback}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {(assignmentDetails.submissionType === 'TEXT' ||
                  assignmentDetails.submissionType === 'BOTH') && (
                  <div>
                    <Label htmlFor="submission-text">Your Answer</Label>
                    <Textarea
                      id="submission-text"
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Type your answer here..."
                      rows={10}
                      className="mt-2"
                    />
                  </div>
                )}

                {(assignmentDetails.submissionType === 'FILE' ||
                  assignmentDetails.submissionType === 'BOTH') && (
                  <div>
                    <Label htmlFor="file-upload">Upload Files</Label>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="mt-2 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    {uploading && (
                      <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                    )}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-2">
                        <Label>Uploaded Files:</Label>
                        <ul className="list-disc list-inside text-sm">
                          {uploadedFiles.map((file, idx) => (
                            <li key={idx}>{file.originalFilename || file.publicId}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Submissions (for teachers) */}
      {isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>
              All Submissions ({allSubmissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allSubmissions.length === 0 ? (
              <p className="text-gray-600">No submissions yet</p>
            ) : (
              <div className="space-y-4">
                {allSubmissions.map((submission) => (
                  <Card key={submission.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{submission.studentName}</p>
                          <p className="text-sm text-gray-600">
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                          {submission.status.toUpperCase()}
                          {submission.grade !== null && ` - ${submission.grade}pts`}
                        </Badge>
                      </div>
                      {submission.content && (
                        <p className="text-sm mt-2 whitespace-pre-wrap">
                          {submission.content}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          router.push(
                            `/classroom/${params.id}/assignment/${assignmentId}/submission/${submission.id}`
                          )
                        }
                      >
                        View & Grade
                      </Button>
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
