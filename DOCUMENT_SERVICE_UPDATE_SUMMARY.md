# Document Service Update Summary

## Ngày cập nhật: November 10, 2025

## Tổng quan thay đổi

Đã cập nhật Document Service frontend code để đồng bộ với API Documentation mới (v1.0).

---

## Chi tiết thay đổi

### 1. ✅ Tạo file DTO mới: `src/lib/dto/document.ts`

**Nội dung:**
- Định nghĩa đầy đủ các DTOs theo API documentation
- Các enums: `DocumentStatus`, `JobStatus`
- Các interfaces:
  - `ProcessingJobDto`
  - `DocumentResponseDto`
  - `ChunkDto`
  - `LessonDto`
  - `ChapterDto`
  - `DocumentStructureDto`
  - `PaginationDto`
  - `PaginatedChunksDto`
  - `ProcessingStatusDto`
  - `SearchResultDto`
  - `DocumentsListResponse`
  - `TocAnalysisDto`
  - `DocumentApiResponse<T>` - Response wrapper riêng cho Document Service

**Lý do tạo file mới:**
- Tách biệt DTOs của Document Service ra khỏi service file
- Dễ maintain và reuse
- Follow best practices (separation of concerns)

---

### 2. ✅ Cập nhật `src/lib/services/document.service.ts`

#### 2.1. Sửa BASE_URL

**Trước:**
```typescript
const BASE_URL = 'http://localhost:8080/api/v1/document/api/v1/documents';
```

**Sau:**
```typescript
const BASE_URL = 'http://localhost:8080/api/v1/document';
```

**Giải thích:**
- URL cũ bị duplicate path: `/api/v1/document/api/v1/documents` ❌
- URL mới đúng theo API doc: `/api/v1/document` ✅
- Gateway (port 8080) sẽ tự động rewrite `/api/v1/document/*` thành `/api/v1/documents/*` khi route đến Document Service (port 8091)
- Frontend **KHÔNG** nên thêm 's' vào cuối 'document'

#### 2.2. Import DTOs từ file mới

**Thay đổi:**
```typescript
// Xóa tất cả inline interface definitions
// Import từ @/lib/dto/document
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
```

#### 2.3. Đổi tên ApiResponse thành DocumentApiResponse

**Lý do:**
- Tránh conflict với `ApiResponse` trong `src/lib/dto/common.ts`
- `common.ts` định nghĩa: `{code, message, result}` - dùng cho các service khác
- Document Service dùng: `{success, message, data}` - format riêng

**Cập nhật:**
- Tất cả return types từ `Promise<ApiResponse<T>>` → `Promise<DocumentApiResponse<T>>`
- Export `DocumentApiResponse` từ DTO file

#### 2.4. Thêm API function mới: getTocAnalysis

**API mới:**
```typescript
export async function getTocAnalysis(
  documentId: string
): Promise<DocumentApiResponse<TocAnalysisDto>>
```

**Endpoint:** `GET /api/v1/document/{documentId}/toc-analysis`

**Công dụng:**
- Lấy phân tích table of contents của document
- Trả về content preview (1000 ký tự đầu)

---

### 3. ✅ Giữ nguyên các helper functions

Các utility functions đã tồn tại và đúng, không cần thay đổi:
- `formatFileSize(bytes)` - Format bytes thành KB/MB/GB
- `formatDate(dateString)` - Format ISO datetime sang VN locale
- `getStatusColor(status)` - Get Tailwind classes cho status badge
- `getStatusLabel(status)` - Get Vietnamese label cho status
- `getStepLabel(step)` - Get Vietnamese label cho processing steps

---

## So sánh API Response Format

### Common Services (Media, Auth, Content, etc.)
```typescript
interface ApiResponse<T> {
  code: number;        // HTTP status code
  message: string;
  result: T | null;
}
```

### Document Service
```typescript
interface DocumentApiResponse<T> {
  success: boolean;    // true/false
  message?: string;    // optional
  data: T;            // not 'result'
}
```

**Lưu ý quan trọng:**
- Document Service có response format **KHÁC** với các service khác
- Đừng nhầm lẫn `data` vs `result`
- Đừng nhầm lẫn `success: boolean` vs `code: number`

---

## Checklist tương thích

✅ **BASE_URL đúng:** `/api/v1/document` (không có 's')  
✅ **DTOs đầy đủ:** Tất cả types từ API doc đã được định nghĩa  
✅ **Response wrapper đúng:** Dùng `DocumentApiResponse<T>`  
✅ **All endpoints implemented:**
  - ✅ Upload document
  - ✅ Trigger processing
  - ✅ Get all documents (with status filter)
  - ✅ Get document by ID
  - ✅ Get processing status
  - ✅ Get document structure
  - ✅ Get document chunks (with pagination & filters)
  - ✅ Get chunk by ID
  - ✅ Search chunks
  - ✅ Delete document
  - ✅ Get available statuses
  - ✅ Get TOC analysis (NEW)

✅ **Helper functions:** All utility functions available  
✅ **Components tương thích:** Existing admin components không cần thay đổi

---

## Components sử dụng Document Service

Các components sau đã được kiểm tra và **KHÔNG** cần thay đổi (vì đã dùng đúng `.success` và `.data`):

1. `src/components/admin/document-management/DocumentList.tsx`
2. `src/components/admin/document-management/DocumentDetail.tsx`
3. `src/components/admin/document-management/UploadModal.tsx`
4. `src/components/admin/document-management/ProcessingTracker.tsx`

---

## Testing Recommendations

### 1. Test Upload Flow
```typescript
// Test file upload với progress tracking
const result = await uploadDocument(
  file,
  'Test Document',
  'Description',
  (progress) => console.log(`Upload: ${progress}%`)
);

console.log(result.success); // should be true
console.log(result.data.id); // document ID
console.log(result.data.status); // should be 'UPLOADED'
```

### 2. Test Processing Flow
```typescript
// Trigger processing
const processResult = await triggerProcessing(documentId);
console.log(processResult.data.status); // should be 'PENDING' or 'RUNNING'

// Poll status
const interval = setInterval(async () => {
  const statusResult = await getProcessingStatus(documentId);
  if (statusResult.data.hasJob) {
    const job = statusResult.data.job;
    console.log(`Progress: ${job.progress}%`);
    console.log(`Step: ${getStepLabel(job.currentStep)}`);
    
    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
      clearInterval(interval);
    }
  }
}, 3000);
```

### 3. Test Structure & Chunks
```typescript
// Get structure
const structure = await getDocumentStructure(documentId);
console.log(`Total chunks: ${structure.data.totalChunks}`);
console.log(`Chapters: ${structure.data.structure.length}`);

// Get chunks of a lesson
const chunks = await getDocumentChunks(documentId, {
  chapter: 1,
  lesson: 1,
  page: 0,
  size: 20
});
console.log(`Chunks: ${chunks.data.chunks.length}`);
console.log(`Total: ${chunks.data.pagination.totalElements}`);
```

### 4. Test Search
```typescript
const searchResult = await searchChunks(documentId, 'programming');
console.log(`Found: ${searchResult.data.totalResults} results`);
searchResult.data.results.forEach(chunk => {
  console.log(`- Chapter ${chunk.chapterNumber}, Lesson ${chunk.lessonNumber}`);
});
```

---

## Migration Notes

Nếu có code cũ sử dụng Document Service:

### ❌ Deprecated (DON'T USE)
```typescript
// Old wrong URL
const response = await fetch('http://localhost:8080/api/v1/documents/...');

// Old wrong response access
const doc = response.result; // Wrong! 'result' doesn't exist in Document API
```

### ✅ Correct (USE THIS)
```typescript
// Correct URL (no 's' at the end)
const response = await fetch('http://localhost:8080/api/v1/document/...');

// Correct response access
const doc = response.data; // Correct! Use 'data' not 'result'
```

---

## Important URLs to Remember

| Service | Frontend URL | Backend Service Port |
|---------|-------------|---------------------|
| Gateway | http://localhost:8080 | 8080 |
| Document Service | http://localhost:8080/api/v1/document | 8091 (internal) |
| Auth Service | http://localhost:8080/api/v1/auth | 8082 |
| Content Service | http://localhost:8080/api/v1/content | 8083 |
| Media Service | http://localhost:8080/api/v1/media | 8084 |

**Rule:** Frontend chỉ gọi qua Gateway (port 8080), KHÔNG gọi trực tiếp đến service ports!

---

## API Documentation Reference

Tham khảo file đính kèm:
- `DOCUMENT_SERVICE_API_DOCUMENTATION.md` - Full API spec với examples

---

## Files Changed

### Created
- ✅ `src/lib/dto/document.ts` - New DTOs file

### Modified
- ✅ `src/lib/services/document.service.ts` - Updated BASE_URL, imports, and API response types

### No Changes Required
- ✅ `src/lib/dto/common.ts` - Giữ nguyên (dùng cho các service khác)
- ✅ `src/components/admin/document-management/*.tsx` - Không cần sửa (đã tương thích)

---

## Next Steps

1. ✅ Test upload document qua admin UI
2. ✅ Test processing flow với progress tracking
3. ✅ Test document structure display
4. ✅ Test chunks pagination và filtering
5. ✅ Test search functionality
6. ⚠️ Cần Backend đảm bảo API endpoints hoạt động đúng theo documentation
7. ⚠️ Verify Gateway routing từ `/api/v1/document/*` đến Document Service

---

## Questions & Contact

Nếu gặp vấn đề:
1. Check browser Network tab để xem request URL có đúng không
2. Check response format có match với `DocumentApiResponse<T>` không
3. Check `response.success` và `response.data` thay vì `response.code` và `response.result`
4. Liên hệ Backend team nếu API behavior khác với documentation

---

**Last Updated:** November 10, 2025  
**Updated By:** GitHub Copilot  
**Status:** ✅ Completed
