'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getProcessingStatus,
  JobStatus,
  getStepLabel,
} from '@/lib/services/document.service';
import { useToast } from '@/hooks/use-toast';

interface ProcessingTrackerProps {
  documentId: string;
  onComplete: () => void;
  onClose: () => void;
}

export default function ProcessingTracker({
  documentId,
  onComplete,
  onClose,
}: ProcessingTrackerProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [status, setStatus] = useState<JobStatus>(JobStatus.PENDING);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const response = await getProcessingStatus(documentId);
        
        if (response.success && response.data.hasJob && response.data.job) {
          const job = response.data.job;
          setProgress(job.progress);
          setCurrentStep(job.currentStep);
          setStatus(job.status);
          setErrorMessage(job.errorMessage);

          if (job.status === JobStatus.COMPLETED) {
            clearInterval(intervalId);
            toast({
              title: 'Xử lý hoàn tất',
              description: 'Tài liệu đã được xử lý thành công',
            });
            setTimeout(() => {
              onComplete();
            }, 2000);
          } else if (job.status === JobStatus.FAILED) {
            clearInterval(intervalId);
            toast({
              title: 'Xử lý thất bại',
              description: job.errorMessage || 'Có lỗi xảy ra trong quá trình xử lý',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('Failed to get processing status:', error);
      }
    };

    // Initial poll
    pollStatus();

    // Poll every 3 seconds
    intervalId = setInterval(pollStatus, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [documentId, onComplete, toast]);

  const getStatusIcon = () => {
    switch (status) {
      case JobStatus.COMPLETED:
        return <CheckCircle2 className="w-8 h-8 text-green-400" />;
      case JobStatus.FAILED:
        return <XCircle className="w-8 h-8 text-red-400" />;
      default:
        return <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case JobStatus.COMPLETED:
        return 'from-green-500 to-emerald-500';
      case JobStatus.FAILED:
        return 'from-red-500 to-rose-500';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="bg-slate-800 border-purple-500/30 text-white w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center">
              {getStatusIcon()}
              <span className="ml-3">
                {status === JobStatus.COMPLETED
                  ? 'Hoàn thành'
                  : status === JobStatus.FAILED
                  ? 'Thất bại'
                  : 'Đang xử lý'}
              </span>
            </CardTitle>
            {(status === JobStatus.COMPLETED || status === JobStatus.FAILED) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-purple-200 hover:bg-purple-500/20"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-200">Tiến độ</span>
              <span className="text-white font-bold">{progress}%</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3" />
              <div
                className={`absolute inset-0 h-3 rounded-full bg-gradient-to-r ${getStatusColor()} opacity-20`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Step */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
            <p className="text-sm text-purple-200 mb-1">Bước hiện tại:</p>
            <p className="text-white font-medium">{getStepLabel(currentStep)}</p>
          </div>

          {/* Error Message */}
          {status === JobStatus.FAILED && errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-300">
                <strong>Lỗi:</strong> {errorMessage}
              </p>
            </div>
          )}

          {/* Processing Info */}
          {status === JobStatus.RUNNING && (
            <div className="text-center">
              <p className="text-sm text-purple-200">
                Vui lòng đợi, quá trình này có thể mất vài phút...
              </p>
            </div>
          )}

          {/* Success Message */}
          {status === JobStatus.COMPLETED && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <p className="text-green-300 font-medium">
                ✓ Tài liệu đã được xử lý thành công!
              </p>
            </div>
          )}

          {/* Processing Steps Info */}
          {status !== JobStatus.COMPLETED && status !== JobStatus.FAILED && (
            <div className="space-y-2 text-sm text-purple-200">
              <p className="font-medium">Các bước xử lý:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li className={currentStep === 'EXTRACTING' ? 'text-white font-medium' : ''}>
                  Trích xuất văn bản từ PDF
                </li>
                <li className={currentStep === 'CHUNKING' ? 'text-white font-medium' : ''}>
                  Chia nhỏ tài liệu thành các phần
                </li>
                <li className={currentStep === 'EMBEDDING' ? 'text-white font-medium' : ''}>
                  Tạo vector embeddings
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
