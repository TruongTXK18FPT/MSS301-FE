# Document Service - Quick Reference Comparison

## Key Changes at a Glance

### 1. BASE URL Fix

```diff
- const BASE_URL = 'http://localhost:8080/api/v1/document/api/v1/documents';
+ const BASE_URL = 'http://localhost:8080/api/v1/document';
```

**Why?** The old URL had duplicate paths. Gateway handles routing to the actual service.

---

### 2. Response Format

#### Document Service (NEW - Different from others!)
```typescript
interface DocumentApiResponse<T> {
  success: boolean;    // ✅ true/false
  message?: string;
  data: T;            // ✅ Use 'data'
}

// Usage
const response = await getAllDocuments();
if (response.success) {
  const docs = response.data.documents; // ✅
}
```

#### Other Services (Auth, Content, Media)
```typescript
interface ApiResponse<T> {
  code: number;        // ✅ HTTP status code
  message: string;
  result: T | null;   // ✅ Use 'result'
}

// Usage
const response = await authService.login();
const user = response.result; // ✅
```

---

### 3. File Structure

```
src/lib/
├── dto/
│   ├── common.ts           # ApiResponse<T> for most services
│   ├── document.ts         # NEW! DocumentApiResponse<T> + all DTOs
│   ├── auth.ts
│   ├── mindmap.ts
│   └── ...
└── services/
    ├── document.service.ts  # UPDATED! Imports from dto/document.ts
    ├── auth.service.ts
    └── ...
```

---

## Quick API Reference

### Upload & Process
```typescript
// 1. Upload
const uploadResult = await uploadDocument(file, 'Title', 'Description');
const docId = uploadResult.data.id;

// 2. Trigger processing
await triggerProcessing(docId);

// 3. Poll status
const status = await getProcessingStatus(docId);
console.log(status.data.job?.progress); // 0-100
```

### Get Document Info
```typescript
// Single document
const doc = await getDocumentById(docId);
console.log(doc.data.status); // UPLOADED, PROCESSING, COMPLETED, FAILED

// All documents
const all = await getAllDocuments();
console.log(all.data.documents);

// Filter by status
const completed = await getAllDocuments(DocumentStatus.COMPLETED);
```

### Structure & Content
```typescript
// Get structure (TOC)
const structure = await getDocumentStructure(docId);
structure.data.structure.forEach(chapter => {
  console.log(`Chapter ${chapter.number}: ${chapter.title}`);
  chapter.lessons.forEach(lesson => {
    console.log(`  Lesson ${lesson.number}: ${lesson.title} (${lesson.chunkCount} chunks)`);
  });
});

// Get chunks
const chunks = await getDocumentChunks(docId, {
  chapter: 1,
  lesson: 1,
  page: 0,
  size: 20
});

// Search
const results = await searchChunks(docId, 'keyword');
```

---

## Enums Reference

### DocumentStatus
```typescript
enum DocumentStatus {
  UPLOADED    = 'UPLOADED',     // Đã tải lên
  PROCESSING  = 'PROCESSING',   // Đang xử lý
  COMPLETED   = 'COMPLETED',    // Hoàn thành
  FAILED      = 'FAILED',       // Thất bại
  DELETED     = 'DELETED'       // Đã xóa
}
```

### JobStatus
```typescript
enum JobStatus {
  PENDING    = 'PENDING',       // Đang chờ
  RUNNING    = 'RUNNING',       // Đang chạy
  COMPLETED  = 'COMPLETED',     // Hoàn thành
  FAILED     = 'FAILED',        // Thất bại
  CANCELLED  = 'CANCELLED'      // Đã hủy
}
```

---

## Helper Functions

```typescript
// Format
formatFileSize(bytes)     // "2.5 MB"
formatDate(isoString)     // "10/11/2025, 14:30"

// Status helpers
getStatusLabel(status)    // "Hoàn thành"
getStatusColor(status)    // "bg-green-500/20 text-green-300..."
getStepLabel(step)        // "Đang trích xuất văn bản..."
```

---

## Common Patterns

### Upload with Progress
```typescript
const [progress, setProgress] = useState(0);

await uploadDocument(
  file, 
  title, 
  description,
  (p) => setProgress(p)  // Callback for progress updates
);
```

### Processing with Polling
```typescript
useEffect(() => {
  if (!processingDocId) return;
  
  const interval = setInterval(async () => {
    const status = await getProcessingStatus(processingDocId);
    
    if (status.data.hasJob) {
      const job = status.data.job;
      setProgress(job.progress);
      
      if (job.status === 'COMPLETED') {
        clearInterval(interval);
        onComplete();
      } else if (job.status === 'FAILED') {
        clearInterval(interval);
        onError(job.errorMessage);
      }
    }
  }, 3000); // Poll every 3 seconds
  
  return () => clearInterval(interval);
}, [processingDocId]);
```

### Paginated Chunks Display
```typescript
const [page, setPage] = useState(0);
const [chunks, setChunks] = useState([]);

useEffect(() => {
  loadChunks();
}, [page]);

const loadChunks = async () => {
  const result = await getDocumentChunks(docId, {
    page,
    size: 20
  });
  
  setChunks(result.data.chunks);
  setTotalPages(result.data.pagination.totalPages);
};
```

---

## Troubleshooting

### ❌ Error: "Cannot find name 'ApiResponse'"
**Fix:** Use `DocumentApiResponse` instead, imported from `@/lib/dto/document`

### ❌ Error: "Property 'result' does not exist"
**Fix:** Use `.data` not `.result` for Document Service

### ❌ Error: 404 Not Found
**Check:** Is the URL `http://localhost:8080/api/v1/document/...`? (no 's' at the end)

### ❌ Error: "success is undefined"
**Check:** Are you using Document Service API? If yes, use `.success`. If other service, use `.code`

---

## Import Cheatsheet

```typescript
// Document Service - Everything you need
import {
  // Types
  DocumentStatus,
  JobStatus,
  DocumentResponseDto,
  ChunkDto,
  DocumentStructureDto,
  ProcessingStatusDto,
  DocumentApiResponse,
  
  // API Functions
  uploadDocument,
  triggerProcessing,
  getAllDocuments,
  getDocumentById,
  getProcessingStatus,
  getDocumentStructure,
  getDocumentChunks,
  searchChunks,
  deleteDocument,
  getTocAnalysis,
  
  // Helpers
  formatFileSize,
  formatDate,
  getStatusLabel,
  getStatusColor,
  getStepLabel,
} from '@/lib/services/document.service';
```

---

**Pro Tip:** Always check `response.success` first before accessing `response.data` to handle errors properly!
