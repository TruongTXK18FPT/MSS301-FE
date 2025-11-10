'use client';

import React, { useEffect, useState } from 'react';
import { Eye, Trash2, PlayCircle, Upload, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  DocumentResponseDto,
  DocumentStatus,
  getAllDocuments,
  deleteDocument,
  triggerProcessing,
  formatFileSize,
  formatDate,
  getStatusColor,
  getStatusLabel,
  getAvailableStatuses,
} from '@/lib/services/document.service';
import UploadModal from './UploadModal';
import ProcessingTracker from './ProcessingTracker';

export default function DocumentList() {
  const [documents, setDocuments] = useState<DocumentResponseDto[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'ALL'>('ALL');
  const [availableStatuses, setAvailableStatuses] = useState<DocumentStatus[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
    loadStatuses();
  }, []);

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredDocuments(documents);
    } else {
      setFilteredDocuments(documents.filter(doc => doc.status === statusFilter));
    }
  }, [statusFilter, documents]);

  const loadStatuses = async () => {
    try {
      const response = await getAvailableStatuses();
      if (response.success) {
        setAvailableStatuses(response.data);
      }
    } catch (error) {
      console.error('Failed to load statuses:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await getAllDocuments();
      if (response.success) {
        setDocuments(response.data.documents);
      } else {
        toast({
          title: 'Lỗi',
          description: response.message || 'Không thể tải danh sách tài liệu',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tải danh sách tài liệu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      const response = await deleteDocument(documentToDelete);
      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Đã xóa tài liệu',
        });
        loadDocuments();
      } else {
        toast({
          title: 'Lỗi',
          description: response.message || 'Không thể xóa tài liệu',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể xóa tài liệu',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleProcess = async (documentId: string) => {
    try {
      const response = await triggerProcessing(documentId);
      if (response.success) {
        toast({
          title: 'Bắt đầu xử lý',
          description: 'Đang xử lý tài liệu...',
        });
        setProcessingDocId(documentId);
      } else {
        toast({
          title: 'Lỗi',
          description: response.message || 'Không thể bắt đầu xử lý',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể bắt đầu xử lý',
        variant: 'destructive',
      });
    }
  };

  const handleUploadSuccess = (documentId: string) => {
    setUploadModalOpen(false);
    loadDocuments();
    setProcessingDocId(documentId);
  };

  const handleProcessingComplete = () => {
    setProcessingDocId(null);
    loadDocuments();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-200">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý Tài liệu PDF</h2>
          <p className="text-purple-200 mt-1">
            Tổng số: {documents.length} tài liệu
          </p>
        </div>
        <Button
          onClick={() => setUploadModalOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload PDF
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-lg p-4">
        <Filter className="w-5 h-5 text-purple-300" />
        <span className="text-purple-200">Lọc theo trạng thái:</span>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as DocumentStatus | 'ALL')}
        >
          <SelectTrigger className="w-48 bg-slate-700/50 border-purple-500/30 text-white">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            {availableStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={loadDocuments}
          className="border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-purple-500/20 hover:bg-purple-500/5">
              <TableHead className="text-purple-200">Tiêu đề</TableHead>
              <TableHead className="text-purple-200">Tên file</TableHead>
              <TableHead className="text-purple-200">Trạng thái</TableHead>
              <TableHead className="text-purple-200">Ngôn ngữ</TableHead>
              <TableHead className="text-purple-200">Kích thước</TableHead>
              <TableHead className="text-purple-200">Tải lên</TableHead>
              <TableHead className="text-purple-200">Xử lý xong</TableHead>
              <TableHead className="text-purple-200 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-purple-200 py-8">
                  Không có tài liệu nào
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow
                  key={doc.id}
                  className="border-purple-500/20 hover:bg-purple-500/5 text-white"
                >
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell className="text-purple-200">{doc.filename}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(doc.status)}>
                      {getStatusLabel(doc.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-purple-200">{doc.language}</TableCell>
                  <TableCell className="text-purple-200">
                    {formatFileSize(doc.size)}
                  </TableCell>
                  <TableCell className="text-purple-200">
                    {formatDate(doc.uploadedAt)}
                  </TableCell>
                  <TableCell className="text-purple-200">
                    {doc.processedAt ? formatDate(doc.processedAt) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {doc.status === DocumentStatus.UPLOADED && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProcess(doc.id)}
                          className="border-green-500/30 text-green-300 hover:bg-green-500/20"
                          title="Bắt đầu xử lý"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/admin/documents/${doc.id}`}
                        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDocumentToDelete(doc.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Upload Modal */}
      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Processing Tracker */}
      {processingDocId && (
        <ProcessingTracker
          documentId={processingDocId}
          onComplete={handleProcessingComplete}
          onClose={() => setProcessingDocId(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-purple-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription className="text-purple-200">
              Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
