/**
 * Document Service API Client
 * Base URL: Gateway/api/v1/document
 * 
 * IMPORTANT: Gateway chạy ở port 8080, Document Service chạy ở port 8091
 * Gateway prefix: /api/v1/document (không có 's')
 * Gateway sẽ tự động rewrite /api/v1/document/* thành /api/v1/documents/* khi route đến Document Service
 * FE chỉ cần gọi qua Gateway
 * KHÔNG sử dụng /api/v1/documents (có 's') trong URL
 */

import {
  DocumentStatus,
  JobStatus,
  ProcessingJobDto,
  DocumentResponseDto,
  ChunkDto,
  DocumentStructureDto,
  PaginatedChunksDto,
  ProcessingStatusDto,
  SearchResultDto,
  DocumentApiResponse,
  DocumentsListResponse,
  TocAnalysisDto,
} from '@/lib/dto/document';
import { documentApi } from './axios';

// Re-export types for convenience
export {
  DocumentStatus,
  JobStatus,
  type ProcessingJobDto,
  type DocumentResponseDto,
  type ChunkDto,
  type DocumentStructureDto,
  type PaginatedChunksDto,
  type ProcessingStatusDto,
  type SearchResultDto,
  type DocumentApiResponse,
  type DocumentsListResponse,
  type TocAnalysisDto,
};

// ============== API Functions ==============

/**
 * Upload PDF document
 */
export async function uploadDocument(
  file: File,
  title?: string,
  description?: string,
  onUploadProgress?: (progress: number) => void
): Promise<DocumentApiResponse<DocumentResponseDto>> {
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);
  if (description) formData.append('description', description);

  try {
    const response = await documentApi.post<DocumentApiResponse<DocumentResponseDto>>(
      '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onUploadProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(progress);
          }
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
    throw new Error(errorMessage);
  }
}

/**
 * Trigger document processing
 */
export async function triggerProcessing(
  documentId: string
): Promise<DocumentApiResponse<ProcessingJobDto>> {
  try {
    const response = await documentApi.post<DocumentApiResponse<ProcessingJobDto>>(
      `/${documentId}/process`
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Processing failed';
    throw new Error(errorMessage);
  }
}

/**
 * Get all documents with optional status filter
 */
export async function getAllDocuments(
  status?: DocumentStatus
): Promise<DocumentApiResponse<DocumentsListResponse>> {
  try {
    const response = await documentApi.get<DocumentApiResponse<DocumentsListResponse>>(
      '',
      {
        params: status ? { status } : undefined,
      }
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch documents';
    throw new Error(errorMessage);
  }
}

/**
 * Get document by ID
 */
export async function getDocumentById(
  documentId: string
): Promise<DocumentApiResponse<DocumentResponseDto>> {
  try {
    const response = await documentApi.get<DocumentApiResponse<DocumentResponseDto>>(
      `/${documentId}`
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Document not found';
    throw new Error(errorMessage);
  }
}

/**
 * Get processing status
 */
export async function getProcessingStatus(
  documentId: string
): Promise<DocumentApiResponse<ProcessingStatusDto>> {
  try {
    const response = await documentApi.get<DocumentApiResponse<ProcessingStatusDto>>(
      `/${documentId}/status`
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to get status';
    throw new Error(errorMessage);
  }
}

/**
 * Get document structure
 */
export async function getDocumentStructure(
  documentId: string
): Promise<DocumentApiResponse<DocumentStructureDto>> {
  try {
    const response = await documentApi.get<DocumentApiResponse<DocumentStructureDto>>(
      `/${documentId}/structure`
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to get structure';
    throw new Error(errorMessage);
  }
}

/**
 * Get document chunks with filters and pagination
 */
export async function getDocumentChunks(
  documentId: string,
  options?: {
    chapter?: number;
    lesson?: number;
    page?: number;
    size?: number;
  }
): Promise<DocumentApiResponse<PaginatedChunksDto>> {
  try {
    const params: Record<string, string> = {};
    
    if (options?.chapter !== undefined) {
      params.chapter = options.chapter.toString();
    }
    if (options?.lesson !== undefined) {
      params.lesson = options.lesson.toString();
    }
    if (options?.page !== undefined) {
      params.page = options.page.toString();
    }
    if (options?.size !== undefined) {
      params.size = options.size.toString();
    }

    const response = await documentApi.get<DocumentApiResponse<PaginatedChunksDto>>(
      `/${documentId}/chunks`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to get chunks';
    throw new Error(errorMessage);
  }
}

/**
 * Get chunk by ID
 */
export async function getChunkById(
  chunkId: string
): Promise<DocumentApiResponse<ChunkDto>> {
  try {
    const response = await documentApi.get<DocumentApiResponse<ChunkDto>>(
      `/chunks/${chunkId}`
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Chunk not found';
    throw new Error(errorMessage);
  }
}

/**
 * Search chunks in document
 */
export async function searchChunks(
  documentId: string,
  query: string
): Promise<DocumentApiResponse<SearchResultDto>> {
  try {
    const response = await documentApi.get<DocumentApiResponse<SearchResultDto>>(
      `/${documentId}/chunks/search`,
      {
        params: { q: query },
      }
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Search failed';
    throw new Error(errorMessage);
  }
}

/**
 * Delete document
 */
export async function deleteDocument(
  documentId: string
): Promise<DocumentApiResponse<null>> {
  try {
    const response = await documentApi.delete<DocumentApiResponse<null>>(
      `/${documentId}`
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Delete failed';
    throw new Error(errorMessage);
  }
}

/**
 * Get available statuses
 */
export async function getAvailableStatuses(): Promise<DocumentApiResponse<DocumentStatus[]>> {
  try {
    const response = await documentApi.get<DocumentApiResponse<DocumentStatus[]>>(
      '/statuses'
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to get statuses';
    throw new Error(errorMessage);
  }
}

/**
 * Get table of contents analysis
 */
export async function getTocAnalysis(
  documentId: string
): Promise<DocumentApiResponse<TocAnalysisDto>> {
  try {
    const response = await documentApi.get<DocumentApiResponse<TocAnalysisDto>>(
      `/${documentId}/toc-analysis`
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to get TOC analysis';
    throw new Error(errorMessage);
  }
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get status badge color
 */
export function getStatusColor(status: DocumentStatus): string {
  switch (status) {
    case DocumentStatus.COMPLETED:
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case DocumentStatus.PROCESSING:
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case DocumentStatus.UPLOADED:
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case DocumentStatus.FAILED:
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case DocumentStatus.DELETED:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    default:
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  }
}

/**
 * Get status label in Vietnamese
 */
export function getStatusLabel(status: DocumentStatus): string {
  switch (status) {
    case DocumentStatus.UPLOADED:
      return 'Đã tải lên';
    case DocumentStatus.PROCESSING:
      return 'Đang xử lý';
    case DocumentStatus.COMPLETED:
      return 'Hoàn thành';
    case DocumentStatus.FAILED:
      return 'Thất bại';
    case DocumentStatus.DELETED:
      return 'Đã xóa';
    default:
      return status;
  }
}

/**
 * Get processing step label in Vietnamese
 */
export function getStepLabel(step: string): string {
  switch (step) {
    case 'INITIALIZING':
      return 'Đang khởi tạo...';
    case 'EXTRACTING':
      return 'Đang trích xuất văn bản...';
    case 'CHUNKING':
      return 'Đang chia nhỏ tài liệu...';
    case 'EMBEDDING':
      return 'Đang tạo vector embeddings...';
    case 'COMPLETED':
      return 'Hoàn thành';
    default:
      return step;
  }
}
