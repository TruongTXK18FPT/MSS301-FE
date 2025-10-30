'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Upload, X, File, FileText, Image as ImageIcon,
  Film, Music, Archive, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { mediaService, MediaResponse } from '@/lib/services/media.service';

interface FileUploadProps {
  folder?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  onFilesUploaded?: (files: MediaResponse[]) => void;
  initialFiles?: MediaResponse[];
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  result?: MediaResponse;
}

export default function FileUpload({
  folder = 'assignments',
  maxFiles = 10,
  maxSizeMB = 50,
  acceptedTypes = ['*/*'],
  onFilesUploaded,
  initialFiles = [],
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<MediaResponse[]>(initialFiles);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext || '')) {
      return <Film className="w-5 h-5 text-purple-500" />;
    }
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) {
      return <Music className="w-5 h-5 text-pink-500" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
      return <Archive className="w-5 h-5 text-yellow-500" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Check file count limit
    if (uploadedFiles.length + uploadingFiles.length + fileArray.length > maxFiles) {
      alert(`Chỉ được tải lên tối đa ${maxFiles} tệp`);
      return;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const oversizedFiles = fileArray.filter(f => f.size > maxSizeBytes);
    if (oversizedFiles.length > 0) {
      alert(`Tệp "${oversizedFiles[0].name}" vượt quá kích thước cho phép ${maxSizeMB}MB`);
      return;
    }

    // Create uploading entries
    const newUploadingFiles: UploadingFile[] = fileArray.map(file => ({
      file,
      progress: 0,
      status: 'uploading',
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload files
    for (let i = 0; i < newUploadingFiles.length; i++) {
      const uploadingFile = newUploadingFiles[i];
      
      try {
        // Simulate progress (since axios doesn't provide real progress for FormData)
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => {
            const updated = [...prev];
            const fileIndex = updated.findIndex(f => f.file === uploadingFile.file);
            if (fileIndex !== -1 && updated[fileIndex].progress < 90) {
              updated[fileIndex].progress += 10;
            }
            return updated;
          });
        }, 200);

        const result = await mediaService.uploadFile(uploadingFile.file, folder);

        clearInterval(progressInterval);

        // Update to success
        setUploadingFiles(prev => {
          const updated = [...prev];
          const fileIndex = updated.findIndex(f => f.file === uploadingFile.file);
          if (fileIndex !== -1) {
            updated[fileIndex].progress = 100;
            updated[fileIndex].status = 'success';
            updated[fileIndex].result = result;
          }
          return updated;
        });

        // Move to uploaded files
        setTimeout(() => {
          setUploadedFiles(prev => {
            const newFiles = [...prev, result];
            onFilesUploaded?.(newFiles);
            return newFiles;
          });
          setUploadingFiles(prev => prev.filter(f => f.file !== uploadingFile.file));
        }, 500);

      } catch (error: any) {
        console.error('Upload error:', error);
        setUploadingFiles(prev => {
          const updated = [...prev];
          const fileIndex = updated.findIndex(f => f.file === uploadingFile.file);
          if (fileIndex !== -1) {
            updated[fileIndex].status = 'error';
            updated[fileIndex].error = error.message || 'Upload failed';
          }
          return updated;
        });
      }
    }
  };

  const handleRemoveFile = async (publicId: string) => {
    if (!confirm('Bạn có chắc muốn xóa tệp này?')) return;

    try {
      await mediaService.deleteFile(publicId);
      const newFiles = uploadedFiles.filter(f => f.publicId !== publicId);
      setUploadedFiles(newFiles);
      onFilesUploaded?.(newFiles);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Xóa tệp thất bại');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${dragActive
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }
        `}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-gray-400'}`} />
        <p className="text-lg font-medium mb-2">
          {dragActive ? 'Thả tệp vào đây' : 'Kéo thả tệp hoặc nhấp để chọn'}
        </p>
        <p className="text-sm text-muted-foreground">
          Tối đa {maxFiles} tệp, mỗi tệp không quá {maxSizeMB}MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept={acceptedTypes.join(',')}
        />
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {uploadingFile.status === 'uploading' && (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    )}
                    {uploadingFile.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {uploadingFile.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadingFile.file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={uploadingFile.progress} className="flex-1 h-1" />
                      <span className="text-xs text-muted-foreground">
                        {uploadingFile.progress}%
                      </span>
                    </div>
                    {uploadingFile.error && (
                      <p className="text-xs text-red-500 mt-1">{uploadingFile.error}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Tệp đã tải lên ({uploadedFiles.length})</h4>
          {uploadedFiles.map((file) => (
            <Card key={file.publicId}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.originalFilename)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.originalFilename}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.bytes)} • {file.format?.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(file.secureUrl, '_blank');
                      }}
                    >
                      Xem
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file.publicId);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
