'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Shield,
  Loader,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService, type UserResponse } from '@/lib/services/admin.service';

const roleLabels = {
  ADMIN: 'Admin',
  TEACHER: 'Giáo viên',
  STUDENT: 'Học sinh',
  GUARDIAN: 'Phụ huynh'
};

const statusLabels = {
  active: 'Hoạt động',
  inactive: 'Không hoạt động',
  suspended: 'Tạm khóa'
};

const statusColors = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  suspended: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await adminService.getAllUsers(currentPage, pageSize);
        setUsers(response.content);
        setTotalUsers(response.totalElements);
      } catch (err: any) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, pageSize]);

  // Filter users locally
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user =>
        user.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter]);

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await adminService.updateUserStatus(userId, newStatus as any);

      // Refresh users list
      const response = await adminService.getAllUsers(currentPage, pageSize);
      setUsers(response.content);
    } catch (err: any) {
      console.error('Failed to update user status:', err);
      setError('Failed to update user status. Please try again.');
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      await adminService.createUser(userData);
      // Refresh users list
      const response = await adminService.getAllUsers(0, pageSize);
      setUsers(response.content);
      setCurrentPage(0);
      setIsCreateDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to create user:', err);
      setError('Failed to create user. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý Users</h2>
          <p className="text-slate-400">Quản lý tài khoản người dùng trong hệ thống</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm User
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Tổng Users</p>
                <p className="text-2xl font-bold text-white">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">Hoạt động</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-slate-400">Email xác thực</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.emailVerified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm text-slate-400">Không hoạt động</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.status === 'INACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-700/50 border-purple-500/30 text-white">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                <SelectItem value="SUSPENDED">Tạm khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Danh sách Users</CardTitle>
          <CardDescription className="text-slate-400">
            {isLoading ? 'Đang tải...' : `Hiển thị ${filteredUsers.length} trong tổng số ${totalUsers} users`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 text-purple-400 animate-spin" />
              <span className="ml-2 text-slate-400">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-500/20">
                    <TableHead className="text-slate-300 w-20 text-center">STT</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Trạng thái</TableHead>
                    <TableHead className="text-slate-300">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, idx) => (
                      <TableRow key={user.id} className="border-purple-500/10 hover:bg-slate-700/30">
                        <TableCell className="text-slate-300 text-center">
                          {currentPage * pageSize + idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.status === 'ACTIVE'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : user.status === 'INACTIVE'
                                  ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }
                          >
                            {user.status === 'ACTIVE' ? 'Hoạt động' : user.status === 'INACTIVE' ? 'Không hoạt động' : 'Tạm khóa'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-800 border-purple-500/20">
                              <DropdownMenuLabel className="text-white">Thao tác</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-purple-500/20" />
                              <DropdownMenuItem
                                onClick={() => { setSelectedUser(user); setIsDetailDialogOpen(true); }}
                                className="text-slate-300 hover:bg-purple-500/20 hover:text-white"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-purple-500/20" />
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(user.id)}
                                className="text-slate-300 hover:bg-purple-500/20 hover:text-white"
                              >
                                {user.status === 'ACTIVE' ? (
                                  <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Vô hiệu hóa
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Kích hoạt
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                        Không có users nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                >
                  Trang trước
                </Button>
                <div className="text-slate-400">Trang {currentPage + 1}</div>
                <Button
                  variant="outline"
                  disabled={(currentPage + 1) * pageSize >= totalUsers}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                >
                  Trang sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Thêm User mới</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tạo tài khoản người dùng mới trong hệ thống
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-slate-300">
                Tên
              </Label>
              <Input
                id="name"
                className="col-span-3 bg-slate-700/50 border-purple-500/30 text-white"
                placeholder="Nhập tên đầy đủ"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                className="col-span-3 bg-slate-700/50 border-purple-500/30 text-white"
                placeholder="Nhập email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right text-slate-300">
                Role
              </Label>
              <Select>
                <SelectTrigger className="col-span-3 bg-slate-700/50 border-purple-500/30 text-white">
                  <SelectValue placeholder="Chọn role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="GUARDIAN">Guardian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right text-slate-300">
                Số điện thoại
              </Label>
              <Input
                id="phone"
                className="col-span-3 bg-slate-700/50 border-purple-500/30 text-white"
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              Hủy
            </Button>
            <Button 
              onClick={() => handleCreateUser({})}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Tạo User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Cập nhật thông tin người dùng
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right text-slate-300">
                Tên
              </Label>
              <Input
                id="edit-name"
                defaultValue={selectedUser?.name}
                className="col-span-3 bg-slate-700/50 border-purple-500/30 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right text-slate-300">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                defaultValue={selectedUser?.email}
                className="col-span-3 bg-slate-700/50 border-purple-500/30 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right text-slate-300">
                Role
              </Label>
              <Select defaultValue={selectedUser?.role}>
                <SelectTrigger className="col-span-3 bg-slate-700/50 border-purple-500/30 text-white">
                  <SelectValue placeholder="Chọn role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="GUARDIAN">Guardian</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right text-slate-300">
                Số điện thoại
              </Label>
              <Input
                id="edit-phone"
                defaultValue={selectedUser?.phone}
                className="col-span-3 bg-slate-700/50 border-purple-500/30 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              Hủy
            </Button>
            <Button 
              onClick={() => handleEditUser({})}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail User Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-slate-900/90 via-indigo-900/60 to-purple-900/60 backdrop-blur-xl border border-purple-500/30 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">Chi tiết User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Thông tin cơ bản của người dùng
            </DialogDescription>
          </DialogHeader>

          {/* Top summary with avatar */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">
                {selectedUser?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-white font-semibold">{selectedUser?.email}</div>
              <div className="text-slate-400 text-sm">ID tạm: #{selectedUser ? currentPage * pageSize + (users.findIndex(u => u.id === selectedUser.id) + 1) : '-'}</div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid md:grid-cols-2 gap-4 py-2">
            <div className="rounded-lg border border-purple-500/20 bg-slate-800/30 p-4">
              <p className="text-slate-400 text-sm">STT</p>
              <p className="text-lg font-semibold">
                {selectedUser ? (currentPage * pageSize + (users.findIndex(u => u.id === selectedUser.id) + 1)) : '-'}
              </p>
            </div>
            <div className="rounded-lg border border-purple-500/20 bg-slate-800/30 p-4">
              <p className="text-slate-400 text-sm">Trạng thái</p>
              <div className="mt-1">
                <Badge
                  variant="outline"
                  className={
                    selectedUser?.status === 'ACTIVE'
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : selectedUser?.status === 'INACTIVE'
                        ? 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }
                >
                  {selectedUser?.status === 'ACTIVE' ? 'Hoạt động' : selectedUser?.status === 'INACTIVE' ? 'Không hoạt động' : 'Tạm khóa'}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg border border-purple-500/20 bg-slate-800/30 p-4 md:col-span-2">
              <p className="text-slate-400 text-sm">Email xác thực</p>
              <div className="mt-1">
                <Badge variant="outline" className={selectedUser?.emailVerified ? 'border-green-500/30 text-green-300' : 'border-red-500/30 text-red-300'}>
                  {selectedUser?.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg border border-purple-500/20 bg-slate-800/30 p-4">
              <p className="text-slate-400 text-sm">Ngày tạo</p>
              <p className="text-white flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                {selectedUser ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : '-'}
              </p>
            </div>
            <div className="rounded-lg border border-purple-500/20 bg-slate-800/30 p-4">
              <p className="text-slate-400 text-sm">Đăng nhập cuối</p>
              <p className="text-white mt-1">
                {selectedUser?.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDetailDialogOpen(false)}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
