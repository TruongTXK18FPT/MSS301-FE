/**
 * Document Service DTOs
 * Based on Document Service API Documentation v1.0
 */

// ============== Enums ==============

export enum DocumentStatus {
  UPLOADED = 'UPLOADED',       // Đã upload, chưa xử lý
  PROCESSING = 'PROCESSING',   // Đang xử lý
  COMPLETED = 'COMPLETED',     // Đã xử lý xong
  FAILED = 'FAILED',          // Xử lý thất bại
  DELETED = 'DELETED'         // Đã xóa
}

export enum JobStatus {
  PENDING = 'PENDING',         // Đang chờ
  RUNNING = 'RUNNING',         // Đang chạy
  COMPLETED = 'COMPLETED',     // Hoàn thành
  FAILED = 'FAILED',          // Thất bại
  CANCELLED = 'CANCELLED'     // Đã hủy
}

// ============== DTOs ==============

/**
 * Processing Job information
 */
export interface ProcessingJobDto {
  id: string;                          // Job ID
  status: JobStatus;                   // Trạng thái job
  currentStep: string;                 // Bước hiện tại: "EXTRACTING", "CHUNKING", "EMBEDDING"
  progress: number;                    // Tiến độ (0-100)
  startedAt: string;                   // ISO 8601 datetime
  completedAt: string | null;          // ISO 8601 datetime (null nếu chưa xong)
  errorMessage: string | null;         // Thông báo lỗi nếu có
  usedOcr: boolean;                    // Có sử dụng OCR không
  processingTimeMs: number | null;     // Thời gian xử lý (milliseconds)
}

/**
 * Document Response DTO
 */
export interface DocumentResponseDto {
  id: string;                          // Document ID
  title: string;                       // Tên tài liệu
  filename: string;                    // Tên file gốc
  status: DocumentStatus;              // Trạng thái
  uploadedAt: string;                  // ISO 8601 datetime
  processedAt: string | null;          // ISO 8601 datetime (null nếu chưa xử lý xong)
  size: number;                        // Kích thước file (bytes)
  language: string;                    // Ngôn ngữ: "VIETNAMESE", "ENGLISH", etc.
  totalPages: number | null;           // Tổng số trang
  description: string | null;          // Mô tả tài liệu
  processingJob?: ProcessingJobDto;    // Thông tin job xử lý (optional)
}

/**
 * Chunk DTO
 */
export interface ChunkDto {
  id: string;                          // Chunk ID
  chunkIndex: number;                  // Vị trí chunk (0-based)
  content: string;                     // Nội dung text
  pageNumber: number | null;           // Số trang
  chapterNumber: number | null;        // Số chapter
  chapterTitle: string | null;         // Tên chapter
  lessonNumber: number | null;         // Số lesson
  lessonTitle: string | null;          // Tên lesson
  lessonId: string | null;             // Lesson ID (dùng để link với content-service)
  tokenCount: number | null;           // Số token
  fromOcr: boolean | null;             // Có phải từ OCR không
  confidence: number | null;           // Độ tin cậy OCR (0-1)
  embedding: number[] | null;          // Vector embedding (thường không cần hiển thị)
}

/**
 * Lesson DTO
 */
export interface LessonDto {
  number: number;                      // Số lesson
  title: string;                       // Tên lesson
  id: string;                          // Lesson ID
  chunkCount: number;                  // Số lượng chunks trong lesson
}

/**
 * Chapter DTO
 */
export interface ChapterDto {
  number: number;                      // Số chapter
  title: string;                       // Tên chapter
  lessons: LessonDto[];                // Danh sách lessons
}

/**
 * Document Structure DTO
 */
export interface DocumentStructureDto {
  documentId: string;
  totalChunks: number;
  structure: ChapterDto[];
}

/**
 * Pagination DTO
 */
export interface PaginationDto {
  page: number;              // Trang hiện tại (0-based)
  size: number;              // Số items trên 1 trang
  totalElements: number;     // Tổng số items
  totalPages: number;        // Tổng số trang
}

/**
 * Paginated Chunks DTO
 */
export interface PaginatedChunksDto {
  chunks: ChunkDto[];
  pagination: PaginationDto;
}

/**
 * Processing Status DTO
 */
export interface ProcessingStatusDto {
  hasJob: boolean;
  job: ProcessingJobDto | null;
}

/**
 * Search Result DTO
 */
export interface SearchResultDto {
  query: string;
  results: ChunkDto[];
  totalResults: number;
}

/**
 * Documents List Response
 */
export interface DocumentsListResponse {
  documents: DocumentResponseDto[];
  total: number;
}

/**
 * Table of Contents Analysis Response
 */
export interface TocAnalysisDto {
  documentId: string;
  contentLength: number;
  contentPreview: string;
}

// ============== API Response Wrapper ==============

/**
 * Standard API Response from Document Service
 * @template T - The type of the data
 */
export interface DocumentApiResponse<T> {
  success: boolean;      // true nếu thành công, false nếu có lỗi
  message?: string;      // Message mô tả (optional)
  data: T;              // Dữ liệu trả về
}
