/**
 * Document Service API Client
 * Base URL: http://localhost:8080/api/v1/document
 * 
 * IMPORTANT: Gateway chạy ở port 8080, Document Service chạy ở port 8091
 * Gateway prefix: /api/v1/document (không có 's')
 * Gateway sẽ tự động rewrite /api/v1/document/* thành /api/v1/documents/* khi route đến Document Service
 * FE chỉ cần gọi: http://localhost:8080/api/v1/document/...
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

const BASE_URL = 'http://localhost:8080/api/v1/document';

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

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onUploadProgress) {
        const progress = Math.round((e.loaded * 100) / e.total);
        onUploadProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(new Error(errorResponse.message || `HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error'));
    });

    xhr.open('POST', `${BASE_URL}/upload`);
    xhr.send(formData);
  });
}

/**
 * Trigger document processing
 */
export async function triggerProcessing(
  documentId: string
): Promise<DocumentApiResponse<ProcessingJobDto>> {
  const response = await fetch(`${BASE_URL}/${documentId}/process`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Processing failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get all documents with optional status filter
 */
export async function getAllDocuments(
  status?: DocumentStatus
): Promise<DocumentApiResponse<DocumentsListResponse>> {
  const url = new URL(BASE_URL);
  if (status) {
    url.searchParams.append('status', status);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch documents' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get document by ID
 */
export async function getDocumentById(
  documentId: string
): Promise<DocumentApiResponse<DocumentResponseDto>> {
  const response = await fetch(`${BASE_URL}/${documentId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Document not found' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get processing status
 */
export async function getProcessingStatus(
  documentId: string
): Promise<DocumentApiResponse<ProcessingStatusDto>> {
  const response = await fetch(`${BASE_URL}/${documentId}/status`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get status' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get document structure
 */
export async function getDocumentStructure(
  documentId: string
): Promise<DocumentApiResponse<DocumentStructureDto>> {
  const response = await fetch(`${BASE_URL}/${documentId}/structure`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get structure' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
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
  const url = new URL(`${BASE_URL}/${documentId}/chunks`);
  
  if (options?.chapter !== undefined) {
    url.searchParams.append('chapter', options.chapter.toString());
  }
  if (options?.lesson !== undefined) {
    url.searchParams.append('lesson', options.lesson.toString());
  }
  if (options?.page !== undefined) {
    url.searchParams.append('page', options.page.toString());
  }
  if (options?.size !== undefined) {
    url.searchParams.append('size', options.size.toString());
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get chunks' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get chunk by ID
 */
export async function getChunkById(
  chunkId: string
): Promise<DocumentApiResponse<ChunkDto>> {
  const response = await fetch(`${BASE_URL}/chunks/${chunkId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Chunk not found' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Search chunks in document
 */
export async function searchChunks(
  documentId: string,
  query: string
): Promise<DocumentApiResponse<SearchResultDto>> {
  const url = new URL(`${BASE_URL}/${documentId}/chunks/search`);
  url.searchParams.append('q', query);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Search failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Delete document
 */
export async function deleteDocument(
  documentId: string
): Promise<DocumentApiResponse<null>> {
  const response = await fetch(`${BASE_URL}/${documentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Delete failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get available statuses
 */
export async function getAvailableStatuses(): Promise<DocumentApiResponse<DocumentStatus[]>> {
  const response = await fetch(`${BASE_URL}/statuses`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get statuses' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get table of contents analysis
 */
export async function getTocAnalysis(
  documentId: string
): Promise<DocumentApiResponse<TocAnalysisDto>> {
  const response = await fetch(`${BASE_URL}/${documentId}/toc-analysis`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get TOC analysis' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
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
