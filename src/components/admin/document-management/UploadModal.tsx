'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { uploadDocument, triggerProcessing } from '@/lib/services/document.service';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (documentId: string) => void;
}

export default function UploadModal({ open, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: 'Lỗi',
          description: 'Chỉ chấp nhận file PDF',
          variant: 'destructive',
        });
        return;
      }

      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: 'Lỗi',
          description: 'File không được vượt quá 50MB',
          variant: 'destructive',
        });
        return;
      }

      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace('.pdf', ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn file PDF',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload file
      const uploadResponse = await uploadDocument(
        file,
        title,
        description,
        (progress) => setUploadProgress(progress)
      );

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || 'Upload thất bại');
      }

      const documentId = uploadResponse.data.id;

      toast({
        title: 'Upload thành công',
        description: 'Đang bắt đầu xử lý tài liệu...',
      });

      // Trigger processing
      await triggerProcessing(documentId);

      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setUploadProgress(0);

      onSuccess(documentId);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể upload tài liệu',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setTitle('');
      setDescription('');
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-purple-500/30 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <Upload className="w-6 h-6 mr-2 text-purple-400" />
            Upload Tài liệu PDF
          </DialogTitle>
          <DialogDescription className="text-purple-200">
            Tải lên file PDF để hệ thống xử lý và tạo nội dung học tập
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file" className="text-white">
              File PDF <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
              <label
                htmlFor="file"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-purple-500/50 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-500/5 transition-colors"
              >
                {file ? (
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-sm text-purple-200 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                    <p className="text-purple-200">
                      Nhấn để chọn file hoặc kéo thả vào đây
                    </p>
                    <p className="text-sm text-purple-300 mt-1">
                      PDF tối đa 50MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Tiêu đề
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề tài liệu"
              disabled={uploading}
              className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Mô tả
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả về tài liệu (tùy chọn)"
              disabled={uploading}
              rows={4}
              className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300 resize-none"
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-200">Đang upload...</span>
                <span className="text-purple-200">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
              className="border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!file || uploading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang upload...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload và Xử lý
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
