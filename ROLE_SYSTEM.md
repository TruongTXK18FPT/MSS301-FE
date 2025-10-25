# Role System Documentation

## Tổng quan

Hệ thống role trong MathMind sử dụng cả Role ID (số) và Role String (chuỗi) để tương thích với backend và frontend.

## Role Mapping

| Role ID | Role String | Mô tả |
|---------|-------------|-------|
| 1 | ADMIN | Quản trị viên hệ thống |
| 2 | STUDENT | Học sinh |
| 3 | GUARDIAN | Phụ huynh |
| 4 | TEACHER | Giáo viên |

## Cách sử dụng

### 1. Import các types và constants

```typescript
import { UserRole, RoleId, ROLE_IDS, ROLE_ID_TO_STRING, ROLE_STRING_TO_ID } from '@/types/classroom';
import { getCurrentRole, isAdmin, isTeacher, isStudent, isGuardian } from '@/lib/role-utils';
```

### 2. Sử dụng trong components

```typescript
import { useAuth } from '@/context/auth-context';
import { getCurrentRole, isAdmin } from '@/lib/role-utils';

function MyComponent() {
  const { role, roleId } = useAuth();
  
  // Lấy role hiện tại (ưu tiên roleId)
  const currentRole = getCurrentRole(role, roleId);
  
  // Kiểm tra role cụ thể
  if (isAdmin(role, roleId)) {
    // Logic cho admin
  }
  
  // Hoặc kiểm tra trực tiếp
  if (currentRole === 'ADMIN') {
    // Logic cho admin
  }
}
```

### 3. Sử dụng trong ProtectedRoute

```typescript
<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
  <AdminContent />
</ProtectedRoute>
```

### 4. Sử dụng trong usePermissions

```typescript
import { usePermissions } from '@/hooks/use-permissions';

function MyComponent() {
  const permissions = usePermissions();
  
  if (permissions.canCreateClassroom) {
    // Hiển thị nút tạo lớp học
  }
}
```

## Backend Integration

### Khi backend trả về role ID (số):

```typescript
// Backend response
{
  "role": 1,  // ADMIN
  "email": "admin@example.com"
}

// Frontend sẽ tự động convert
const roleId = 1;
const roleString = ROLE_ID_TO_STRING[1]; // "ADMIN"
```

### Khi backend trả về role string:

```typescript
// Backend response
{
  "role": "ADMIN",
  "email": "admin@example.com"
}

// Frontend sẽ tự động convert
const roleString = "ADMIN";
const roleId = ROLE_STRING_TO_ID["ADMIN"]; // 1
```

## Utility Functions

### `getCurrentRole(role, roleId)`
Trả về role string hiện tại, ưu tiên roleId nếu có.

### `isAdmin(role, roleId)`
Kiểm tra xem user có phải admin không.

### `isTeacher(role, roleId)`
Kiểm tra xem user có phải teacher không.

### `isStudent(role, roleId)`
Kiểm tra xem user có phải student không.

### `isGuardian(role, roleId)`
Kiểm tra xem user có phải guardian không.

### `hasRole(role, roleId, targetRole)`
Kiểm tra xem user có role cụ thể không.

### `hasAnyRole(role, roleId, targetRoles)`
Kiểm tra xem user có bất kỳ role nào trong danh sách không.

## Migration từ String sang ID

Nếu backend đang trả về role string và muốn chuyển sang role ID:

1. Cập nhật backend để trả về role ID thay vì string
2. Frontend sẽ tự động detect và convert
3. Không cần thay đổi code frontend

## Lưu ý

- Luôn sử dụng utility functions thay vì truy cập trực tiếp role/roleId
- Hệ thống tự động handle cả role ID và role string
- ProtectedRoute vẫn sử dụng role string array
- usePermissions tự động convert role ID sang string
