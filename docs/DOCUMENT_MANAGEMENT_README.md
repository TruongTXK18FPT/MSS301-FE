# Document Management System - Admin

Hệ thống quản lý tài liệu PDF hoàn chỉnh cho Admin Panel của MathMind.

## 📁 Cấu trúc Files

```
src/
├── lib/
│   └── services/
│       └── document.service.ts       # API client và utility functions
├── components/
│   └── admin/
│       └── document-management/
│           ├── DocumentList.tsx      # Trang danh sách tài liệu
│           ├── DocumentDetail.tsx    # Trang chi tiết tài liệu
│           ├── UploadModal.tsx       # Modal upload PDF
│           ├── ProcessingTracker.tsx # Tracker xử lý real-time
│           └── index.ts              # Export file
└── app/
    └── admin/
        ├── documents/
        │   ├── page.tsx              # Route /admin/documents
        │   └── [id]/
        │       └── page.tsx          # Route /admin/documents/:id
        └── page.tsx                  # Admin dashboard chính (đã update)
```

## 🚀 Cài đặt & Setup

### 1. Đảm bảo dependencies đã cài đặt

Tất cả dependencies cần thiết đã có sẵn trong project:
- `react`, `next`
- `lucide-react` (icons)
- UI components từ `shadcn/ui`
- `tailwindcss` (styling)

### 2. Truy cập trang Documents

Sau khi login với quyền Admin, vào Admin Dashboard và click vào menu **"Quản lý Tài liệu"**.

## 🎯 Tính năng chính

### 1. **Danh sách Tài liệu**
- Hiển thị tất cả tài liệu PDF trong hệ thống
- Table với các cột:
  - Tiêu đề
  - Tên file
  - Trạng thái (UPLOADED, PROCESSING, COMPLETED, FAILED)
  - Ngôn ngữ
  - Kích thước
  - Ngày tải lên
  - Ngày xử lý xong
  - Các action buttons
- **Filter theo trạng thái**: Dropdown để lọc documents
- **Làm mới**: Button reload danh sách

### 2. **Upload Tài liệu**
- Click nút "Upload PDF" để mở modal
- **Chọn file**: 
  - Chỉ chấp nhận file PDF
  - Tối đa 50MB
  - Drag & drop hoặc click để chọn
- **Nhập thông tin**:
  - Tiêu đề (tự động lấy từ tên file nếu không nhập)
  - Mô tả (optional)
- **Progress tracking**: 
  - Hiển thị % upload
  - Tự động trigger processing sau khi upload xong
  - Real-time tracking tiến độ xử lý

### 3. **Xử lý Tài liệu (Processing)**
- Sau khi upload hoặc click nút "Process" (với document đã upload)
- Hiển thị modal tracking với:
  - Progress bar (0-100%)
  - Bước hiện tại: EXTRACTING → CHUNKING → EMBEDDING
  - Thông báo lỗi nếu thất bại
- Tự động đóng và refresh khi hoàn thành
- Polling mỗi 3 giây để cập nhật trạng thái

### 4. **Xem Chi tiết Tài liệu**
- Click nút "View" (icon mắt) để mở trang chi tiết
- **Thông tin tổng quan**:
  - Title, description, status
  - Filename, size, language, số trang
  - Ngày upload và xử lý
- **Cấu trúc phân cấp**:
  - Tree view: Chapters → Lessons
  - Click để expand/collapse chapters
  - Click lesson để xem nội dung
- **Nội dung**:
  - Hiển thị chunks của lesson được chọn
  - Pagination tự động
  - Thông tin page number, token count
- **Tìm kiếm**:
  - Search box tìm keyword trong document
  - Highlight từ khóa trong kết quả
  - Hiển thị chapter/lesson chứa keyword

### 5. **Xóa Tài liệu**
- Click nút "Delete" (icon thùng rác)
- Hiển thị confirmation dialog
- Xóa vĩnh viễn document và tất cả dữ liệu liên quan

## 🎨 UI/UX Features

### Styling
- **Cosmic theme**: Gradient purple/pink, galaxy background
- **Consistent với admin panel**: Giống với các trang admin khác
- **Responsive**: Hoạt động tốt trên mobile và desktop
- **Smooth animations**: Transitions, loading states

### Loading States
- Spinner khi load danh sách
- Skeleton screens cho chi tiết
- Progress bars cho upload/processing
- Disabled buttons khi đang xử lý

### Toast Notifications
- Success: Upload thành công, xử lý xong
- Error: Upload lỗi, xử lý thất bại, delete lỗi
- Info: Bắt đầu xử lý

### Status Badges
- **UPLOADED**: Vàng (chưa xử lý)
- **PROCESSING**: Xanh dương (đang xử lý)
- **COMPLETED**: Xanh lá (hoàn thành)
- **FAILED**: Đỏ (thất bại)

## 🔧 API Integration

### Base URL
```
http://localhost:8080/api/v1/document/api/v1/documents
```

### Endpoints được sử dụng

1. **GET** `/` - Lấy danh sách documents
2. **POST** `/upload` - Upload PDF
3. **POST** `/{id}/process` - Trigger xử lý
4. **GET** `/{id}` - Lấy thông tin document
5. **GET** `/{id}/status` - Lấy trạng thái xử lý
6. **GET** `/{id}/structure` - Lấy cấu trúc document
7. **GET** `/{id}/chunks` - Lấy chunks (với filter)
8. **GET** `/{id}/chunks/search` - Tìm kiếm chunks
9. **DELETE** `/{id}` - Xóa document
10. **GET** `/statuses` - Lấy danh sách statuses

### Error Handling
- Try-catch cho tất cả API calls
- Error messages user-friendly
- Toast notifications cho errors
- Fallback UI cho error states

## 📝 Cách sử dụng

### Quy trình Upload & Xử lý mới

1. Vào trang "Quản lý Tài liệu"
2. Click "Upload PDF"
3. Chọn file PDF (max 50MB)
4. Nhập title và description (optional)
5. Click "Upload và Xử lý"
6. Đợi progress bar upload → 100%
7. Hệ thống tự động bắt đầu processing
8. Modal tracking hiển thị:
   - Progress 0% → 100%
   - Các bước: EXTRACTING → CHUNKING → EMBEDDING
9. Khi xong, modal tự động đóng
10. Document xuất hiện trong danh sách với status COMPLETED

### Xem nội dung Document

1. Trong danh sách, click nút "View" (icon mắt)
2. Xem thông tin tổng quan ở đầu trang
3. Bên trái: Cấu trúc phân cấp (Chapters & Lessons)
4. Click chapter để expand
5. Click lesson để xem nội dung
6. Nội dung chunks hiển thị bên phải
7. Dùng search box để tìm keyword

### Tìm kiếm trong Document

1. Ở trang chi tiết document
2. Nhập keyword vào search box
3. Press Enter hoặc click nút Search
4. Kết quả hiển thị với keyword được highlight
5. Mỗi kết quả cho biết chapter/lesson chứa keyword

### Xử lý Document đã upload

Nếu document đã upload nhưng chưa xử lý (status = UPLOADED):

1. Trong danh sách, tìm document với badge vàng "Đã tải lên"
2. Click nút "Process" (icon play)
3. Processing tracker hiển thị
4. Đợi cho đến khi hoàn thành

## 🐛 Troubleshooting

### Upload không hoạt động
- **Kiểm tra**: File có phải PDF không? Có quá 50MB không?
- **Kiểm tra**: Backend service có đang chạy không?
- **Kiểm tra**: Network tab trong DevTools để xem lỗi

### Processing mãi không xong
- **Normal**: Document lớn có thể mất 5-10 phút
- **Check**: Xem backend logs có lỗi không
- **Refresh**: Click "Làm mới" để cập nhật status

### Không thấy nội dung chunks
- **Kiểm tra**: Document đã xử lý xong chưa (status = COMPLETED)?
- **Click**: Phải click vào lesson trong structure để load chunks
- **Wait**: Chunks load có thể mất vài giây

### Search không trả về kết quả
- **Kiểm tra**: Keyword có tồn tại trong document không?
- **Try**: Thử keyword khác hoặc ngắn hơn
- **Check**: Document đã xử lý xong chưa?

## 🔐 Permissions

Chỉ user với role **ADMIN** mới có thể:
- Truy cập trang Documents
- Upload tài liệu mới
- Xử lý tài liệu
- Xóa tài liệu
- Xem toàn bộ documents trong hệ thống

## 📊 Performance Tips

### Polling
- Processing status polling: 3 giây/lần
- Tự động stop khi hoàn thành/thất bại
- Giới hạn max 10 phút (200 polls)

### Pagination
- Chunks load 20 items mỗi lần
- Có thể tăng size nếu cần
- Lazy loading khi scroll (future enhancement)

### Caching
- Document info được cache sau lần load đầu
- Structure được cache
- Chunks không cache (để đảm bảo data mới nhất)

## 🚀 Future Enhancements

Các tính năng có thể thêm sau:

1. **Bulk Upload**: Upload nhiều files cùng lúc
2. **Export**: Export chunks sang JSON/CSV
3. **Edit Metadata**: Sửa title/description sau khi upload
4. **Version Control**: Quản lý versions của document
5. **Analytics**: Thống kê số lượng chunks, tokens, etc.
6. **Advanced Search**: Semantic search với embeddings
7. **Preview PDF**: Xem PDF trực tiếp trong browser
8. **Share Links**: Tạo link public cho document

## 📚 API Documentation

Xem file đính kèm: `DOCUMENT_SERVICE_API_DOCUMENTATION.md` để biết chi tiết về:
- Tất cả endpoints
- Request/response formats
- Error codes
- Best practices
- Testing examples

## ✅ Checklist Hoàn thành

- [x] Document Service API Client
- [x] DocumentList component với filter & actions
- [x] UploadModal với progress tracking
- [x] ProcessingTracker với real-time updates
- [x] DocumentDetail với structure & content view
- [x] Search functionality với highlighting
- [x] Delete confirmation
- [x] Admin menu integration
- [x] Routing setup (/admin/documents và /admin/documents/:id)
- [x] Error handling & toast notifications
- [x] Responsive design
- [x] Loading states
- [x] Status badges & formatting utilities

## 🎓 Hướng dẫn mở rộng

### Thêm một endpoint API mới

1. Thêm interface type trong `document.service.ts`
2. Thêm function gọi API
3. Export function
4. Sử dụng trong component với error handling

```typescript
// Trong document.service.ts
export async function newApiFunction(param: string): Promise<ApiResponse<DataType>> {
  const response = await fetch(`${BASE_URL}/new-endpoint/${param}`);
  if (!response.ok) {
    throw new Error('API call failed');
  }
  return response.json();
}

// Trong component
const handleAction = async () => {
  try {
    const result = await newApiFunction(id);
    if (result.success) {
      toast({ title: 'Success!' });
    }
  } catch (error) {
    toast({ 
      title: 'Error', 
      description: error.message,
      variant: 'destructive' 
    });
  }
};
```

### Thêm một component mới

1. Tạo file trong `components/admin/document-management/`
2. Import dependencies
3. Export trong `index.ts`
4. Sử dụng trong DocumentList hoặc DocumentDetail

---

**Phát triển bởi**: MSS301 Team  
**Ngày**: November 10, 2025  
**Version**: 1.0.0
