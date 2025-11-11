'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, FileText, CheckCircle, Clock, 
  AlertCircle, Download, Trash2 
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface AssignmentSubmissionFormProps {
  classroomContentId: number;
  assignmentDetails: {
    title: string;
    instructions: string;
    dueAt?: string;
    maxPoints: number;
    submissionType: 'TEXT' | 'FILE' | 'BOTH';
    attachmentFileIds?: string;
  };
  existingSubmission?: {
    id: number;
    content?: string;
    fileIds?: string;
    submittedAt: string;
    status: string;
    grade?: number;
    feedback?: string;
  };
  onSubmitSuccess?: () => void;
}

export function AssignmentSubmissionForm({
  classroomContentId,
  assignmentDetails,
  existingSubmission,
  onSubmitSuccess
}: AssignmentSubmissionFormProps) {
  const { id: userId } = useAuth();
  const [submissionText, setSubmissionText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmitText = assignmentDetails.submissionType === 'TEXT' || 
                        assignmentDetails.submissionType === 'BOTH';
  const canSubmitFile = assignmentDetails.submissionType === 'FILE' || 
                        assignmentDetails.submissionType === 'BOTH';
  
  const isLate = assignmentDetails.dueAt 
    ? new Date() > new Date(assignmentDetails.dueAt) 
    : false;

  useEffect(() => {
    if (existingSubmission) {
      setSubmissionText(existingSubmission.content || '');
      // Parse file IDs if needed
      if (existingSubmission.fileIds) {
        const fileIdArray = existingSubmission.fileIds.split(',');
        setUploadedFiles(fileIdArray.map(id => ({ publicId: id, originalFilename: id })));
      }
    }
  }, [existingSubmission]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      setError(null);

      // TODO: Integrate with actual media service
      // For now, simulate upload
      const mockUploaded = files.map(file => ({
        publicId: `file_${Date.now()}_${file.name}`,
        originalFilename: file.name,
        url: URL.createObjectURL(file)
      }));

      setUploadedFiles([...uploadedFiles, ...mockUploaded]);
    } catch (err: any) {
      setError('Failed to upload files: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Validation
      if (canSubmitText && !submissionText.trim()) {
        setError('Vui lòng nhập câu trả lời của bạn');
        return;
      }

      if (canSubmitFile && uploadedFiles.length === 0) {
        setError('Vui lòng upload ít nhất 1 file');
        return;
      }

      const fileIds = uploadedFiles.map(f => f.publicId).join(',');

      // TODO: Call submission API
      // await classroomService.submitAssignment(classroomContentId, {
      //   content: canSubmitText ? submissionText : undefined,
      //   fileIds: canSubmitFile ? fileIds : undefined,
      // });

      console.log('Submitting assignment:', {
        classroomContentId,
        content: submissionText,
        fileIds,
        userId
      });

      alert('Bài tập đã được nộp thành công!');
      onSubmitSuccess?.();
    } catch (err: any) {
      setError('Nộp bài thất bại: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Show existing submission
  if (existingSubmission) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Bài nộp của bạn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={
              existingSubmission.status === 'GRADED' ? 'default' :
              existingSubmission.status === 'LATE' ? 'destructive' : 'secondary'
            }>
              {existingSubmission.status}
            </Badge>
            {existingSubmission.grade !== undefined && (
              <Badge variant="outline">
                Điểm: {existingSubmission.grade}/{assignmentDetails.maxPoints}
              </Badge>
            )}
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Thời gian nộp</Label>
            <p className="text-sm font-medium">
              {new Date(existingSubmission.submittedAt).toLocaleString('vi-VN')}
            </p>
          </div>

          {existingSubmission.content && (
            <div>
              <Label className="text-sm text-muted-foreground">Câu trả lời</Label>
              <div className="mt-2 p-4 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{existingSubmission.content}</p>
              </div>
            </div>
          )}

          {existingSubmission.fileIds && (
            <div>
              <Label className="text-sm text-muted-foreground">File đã nộp</Label>
              <div className="mt-2 space-y-2">
                {existingSubmission.fileIds.split(',').map((fileId, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-mono">{fileId}</span>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {existingSubmission.feedback && (
            <div>
              <Label className="text-sm text-muted-foreground">Phản hồi từ giáo viên</Label>
              <Alert className="mt-2">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="whitespace-pre-wrap">
                  {existingSubmission.feedback}
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Bạn đã nộp bài tập này. Liên hệ giáo viên nếu cần nộp lại.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show submission form
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Nộp bài tập
        </CardTitle>
        {isLate && (
          <Alert variant="destructive" className="mt-2">
            <Clock className="w-4 h-4" />
            <AlertDescription>
              Hạn nộp đã qua ({new Date(assignmentDetails.dueAt!).toLocaleString('vi-VN')}). 
              Bài nộp sẽ bị đánh dấu trễ hạn.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Text submission */}
        {canSubmitText && (
          <div>
            <Label htmlFor="submission-text">Câu trả lời của bạn *</Label>
            <Textarea
              id="submission-text"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Nhập câu trả lời của bạn tại đây..."
              rows={12}
              className="mt-2 font-mono"
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {submissionText.length} ký tự
            </p>
          </div>
        )}

        {/* File submission */}
        {canSubmitFile && (
          <div>
            <Label htmlFor="file-upload">Upload file *</Label>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading || submitting}
              accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
              className="mt-2 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploading && (
              <p className="text-sm text-muted-foreground mt-2">
                Đang upload...
              </p>
            )}

            {/* Uploaded files list */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label className="text-sm text-muted-foreground">
                  File đã chọn ({uploadedFiles.length})
                </Label>
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm flex-1">{file.originalFilename}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(idx)}
                      disabled={submitting}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              Hỗ trợ: PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, PNG (tối đa 10MB/file)
            </p>
          </div>
        )}

        {/* Assignment info */}
        <div className="p-4 bg-muted rounded-md space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hạn nộp:</span>
            <span className="font-medium">
              {assignmentDetails.dueAt 
                ? new Date(assignmentDetails.dueAt).toLocaleString('vi-VN')
                : 'Không giới hạn'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Điểm tối đa:</span>
            <span className="font-medium">{assignmentDetails.maxPoints} điểm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Loại bài nộp:</span>
            <span className="font-medium">
              {assignmentDetails.submissionType === 'TEXT' && 'Văn bản'}
              {assignmentDetails.submissionType === 'FILE' && 'File'}
              {assignmentDetails.submissionType === 'BOTH' && 'Văn bản + File'}
            </span>
          </div>
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={submitting || uploading}
          className="w-full"
          size="lg"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Đang nộp bài...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Nộp bài tập
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Kiểm tra kỹ trước khi nộp. Bạn chỉ có thể nộp một lần.
        </p>
      </CardContent>
    </Card>
  );
}
