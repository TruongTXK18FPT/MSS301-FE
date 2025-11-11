'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  BookOpen,
  Calendar,
  Eye,
  Lock,
  Unlock,
  GraduationCap,
  Loader
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
import { Info, Users as UsersIcon, BookMarked, BarChart3 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { adminService, type ClassroomResponse } from '@/lib/services/admin.service';

const subjectOptions = [
  'Toán học',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'Ngữ văn',
  'Lịch sử',
  'Địa lý',
  'Tiếng Anh',
  'Tin học'
];

const gradeOptions = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
];

export default function ClassroomManagement() {
  const [classrooms, setClassrooms] = useState<ClassroomResponse[]>([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState<ClassroomResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomResponse | null>(null);
  const [detailClassroom, setDetailClassroom] = useState<ClassroomResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalClassrooms, setTotalClassrooms] = useState(0);

  // Create form state
  const [createFormData, setCreateFormData] = useState({
    name: '',
    grade: '',
    description: '',
    subject: '',
    maxStudents: 30,
    isPublic: false
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    grade: '',
    description: '',
    subject: '',
    maxStudents: 30,
    isPublic: false
  });

  // Fetch classrooms from API
  useEffect(() => {
    const fetchClassrooms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await adminService.getAllClassrooms(currentPage, pageSize);
        setClassrooms(response.content);
        setTotalClassrooms(response.totalElements);
      } catch (err: any) {
        console.error('Failed to fetch classrooms:', err);
        setError('Failed to load classrooms. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassrooms();
  }, [currentPage, pageSize]);

  // Filter classrooms locally
  useEffect(() => {
    let filtered = classrooms;

    if (searchTerm) {
      filtered = filtered.filter(classroom =>
        classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classroom.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(classroom => classroom.subject === subjectFilter);
    }

    if (gradeFilter !== 'all') {
      filtered = filtered.filter(classroom => classroom.grade === gradeFilter);
    }

    setFilteredClassrooms(filtered);
  }, [classrooms, searchTerm, subjectFilter, gradeFilter]);

  const handleDeleteClassroom = async (classroomId: number) => {
    try {
      await adminService.deleteClassroom(classroomId);
      setClassrooms(classrooms.filter(classroom => classroom.id !== classroomId));
    } catch (err: any) {
      console.error('Failed to delete classroom:', err);
      setError('Failed to delete classroom. Please try again.');
    }
  };

  const handleToggleStatus = async (classroomId: number) => {
    try {
      const classroom = classrooms.find(c => c.id === classroomId);
      if (!classroom) return;

      const payload = {
        name: classroom.name,
        description: classroom.description,
        isPublic: classroom.isPublic,
        grade: classroom.grade,
        subject: classroom.subject || 'Toán học',
        maxStudents: classroom.maxStudents,
      };

      await adminService.updateClassroom(classroomId, payload);

      // Refresh classrooms list
      const response = await adminService.getAllClassrooms(currentPage, pageSize);
      setClassrooms(response.content);
    } catch (err: any) {
      console.error('Failed to update classroom status:', err);
      setError('Failed to update classroom status. Please try again.');
    }
  };

  const handleTogglePublic = async (classroomId: number) => {
    try {
      const classroom = classrooms.find(c => c.id === classroomId);
      if (!classroom) return;

      const payload = {
        name: classroom.name,
        description: classroom.description,
        isPublic: !classroom.isPublic,
        grade: classroom.grade,
        subject: classroom.subject || 'Toán học',
        maxStudents: classroom.maxStudents,
      };

      await adminService.updateClassroom(classroomId, payload);

      // Refresh classrooms list
      const response = await adminService.getAllClassrooms(currentPage, pageSize);
      setClassrooms(response.content);
    } catch (err: any) {
      console.error('Failed to update classroom visibility:', err);
      setError('Failed to update classroom visibility. Please try again.');
    }
  };

  const handleCreateClassroom = async () => {
    // Validate form data
    if (!createFormData.name || !createFormData.grade) {
      setError('Vui lòng điền tên và khối lớp');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        name: createFormData.name,
        grade: createFormData.grade,
        description: createFormData.description,
        subject: createFormData.subject,
        maxStudents: parseInt(createFormData.maxStudents.toString()),
        isPublic: createFormData.isPublic
      };

      await adminService.createClassroom(payload);

      // Refresh classrooms list
      const response = await adminService.getAllClassrooms(0, pageSize);
      setClassrooms(response.content);
      setTotalClassrooms(response.totalElements);
      setCurrentPage(0);

      // Reset form and close dialog
      setCreateFormData({
        name: '',
        grade: '',
        description: '',
        subject: '',
        maxStudents: 30,
        isPublic: false
      });
      setIsCreateDialogOpen(false);
      setError(null);
    } catch (err: any) {
      console.error('Failed to create classroom:', err);
      setError(err?.response?.data?.message || 'Không thể tạo lớp học. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClassroom = async () => {
    // Validate form data
    if (!editFormData.name || !editFormData.grade) {
      setError('Vui lòng điền tên và khối lớp');
      return;
    }

    if (!selectedClassroom) return;

    try {
      setIsLoading(true);
      const payload = {
        name: editFormData.name,
        grade: editFormData.grade,
        description: editFormData.description,
        subject: editFormData.subject || 'Toán học',
        maxStudents: parseInt(editFormData.maxStudents.toString()),
        isPublic: editFormData.isPublic
      };

      console.log('Update payload:', payload);
      await adminService.updateClassroom(selectedClassroom.id, payload);

      // Refresh classrooms list
      const response = await adminService.getAllClassrooms(currentPage, pageSize);
      setClassrooms(response.content);
      setTotalClassrooms(response.totalElements);

      setIsEditDialogOpen(false);
      setSelectedClassroom(null);
      setError(null);
    } catch (err: any) {
      console.error('Failed to update classroom:', err);
      const errorMessage = err?.response?.data?.message
        || err?.response?.data?.error
        || err?.message
        || 'Không thể cập nhật lớp học. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset and open create dialog
  const openCreateDialog = () => {
    setCreateFormData({
      name: '',
      grade: '',
      description: '',
      subject: 'Toán học', // Set default
      maxStudents: 30,
      isPublic: false
    });
    setError(null);
    setIsCreateDialogOpen(true);
  };

  // Set edit form data when dialog opens
  const openEditDialog = (classroom: ClassroomResponse) => {
    setEditFormData({
      name: classroom.name,
      grade: classroom.grade || '',
      description: classroom.description,
      subject: classroom.subject || 'Toán học',
      maxStudents: classroom.maxStudents,
      isPublic: classroom.isPublic
    });
    setSelectedClassroom(classroom);
    setError(null);
    setIsEditDialogOpen(true);
  };

  // Open detail dialog
  const openDetailDialog = (classroom: ClassroomResponse) => {
    setDetailClassroom(classroom);
    setIsDetailDialogOpen(true);
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Toán học': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Vật lý': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Hóa học': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Sinh học': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Ngữ văn': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Lịch sử': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Địa lý': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      'Tiếng Anh': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'Tin học': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    };
    return colors[subject] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý Lớp học</h2>
          <p className="text-slate-400">Quản lý các lớp học trong hệ thống</p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo Lớp học
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">Tổng lớp học</p>
                <p className="text-2xl font-bold text-white">{classrooms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Unlock className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Công khai</p>
                <p className="text-2xl font-bold text-white">
                  {classrooms.filter(c => c.isPublic).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-slate-400">Tổng học sinh</p>
                <p className="text-2xl font-bold text-white">
                  {classrooms.reduce((sum, c) => sum + c.currentStudents, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-slate-400">Môn học</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(classrooms.map(c => c.subject)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm lớp học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn học</SelectItem>
                {subjectOptions.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                <SelectValue placeholder="Chọn khối lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khối</SelectItem>
                {gradeOptions.map(grade => (
                  <SelectItem key={grade} value={grade}>Lớp {grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Classrooms Table */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Danh sách Lớp học</CardTitle>
          <CardDescription className="text-slate-400">
            Hiển thị {filteredClassrooms.length} trong tổng số {totalClassrooms} lớp học
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-6 h-6 text-purple-400 animate-spin" />
              <span className="ml-2 text-slate-400">Đang tải...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-purple-500/20">
                  <TableHead className="text-slate-300">Lớp học</TableHead>
                  <TableHead className="text-slate-300">Giáo viên</TableHead>
                  <TableHead className="text-slate-300">Môn học</TableHead>
                  <TableHead className="text-slate-300">Học sinh</TableHead>
                  <TableHead className="text-slate-300">Công khai</TableHead>
                  <TableHead className="text-slate-300">Ngày tạo</TableHead>
                  <TableHead className="text-slate-300">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClassrooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                      Không tìm thấy lớp học
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClassrooms.map((classroom) => (
                    <TableRow key={classroom.id} className="border-purple-500/10 hover:bg-slate-700/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">{classroom.name}</p>
                          <p className="text-sm text-slate-400">{classroom.description}</p>
                          <p className="text-xs text-slate-500 flex items-center mt-1">
                            <span className="mr-2">Mã: {classroom.joinCode}</span>
                            {classroom.isPublic ? (
                              <Unlock className="w-3 h-3 text-green-400" />
                            ) : (
                              <Lock className="w-3 h-3 text-red-400" />
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">{classroom.owner || `User ${classroom.ownerId}`}</p>
                          <p className="text-sm text-slate-400">{classroom.ownerId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          {classroom.subject ? (
                            <>
                              <Badge
                                variant="outline"
                                className={getSubjectColor(classroom.subject)}
                              >
                                {classroom.subject}
                              </Badge>
                              <span className="text-xs text-slate-400">Lớp {classroom.grade}</span>
                            </>
                          ) : (
                            <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                              Chưa có
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300">
                            {classroom.currentStudents}/{classroom.maxStudents}
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{
                              width: `${(classroom.currentStudents / classroom.maxStudents) * 100}%`
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={classroom.isPublic}
                            onCheckedChange={() => handleTogglePublic(classroom.id)}
                            className="data-[state=checked]:bg-purple-500"
                          />
                          <span className="text-sm text-slate-400">
                            {classroom.isPublic ? 'Công khai' : 'Riêng tư'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                          {new Date(classroom.createdAt).toLocaleDateString('vi-VN')}
                        </div>
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
                              onClick={() => openEditDialog(classroom)}
                              className="text-slate-300 hover:bg-purple-500/20 hover:text-white"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDetailDialog(classroom)}
                              className="text-slate-300 hover:bg-purple-500/20 hover:text-white"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-purple-500/20" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClassroom(classroom.id)}
                              className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Classroom Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo Lớp học mới</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tạo lớp học mới trong hệ thống
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">Tên lớp học</Label>
                <Input
                  id="name"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  placeholder="Nhập tên lớp học"
                />
              </div>
              <div>
                <Label htmlFor="grade" className="text-slate-300">Khối lớp</Label>
                <Select value={createFormData.grade} onValueChange={(value) => setCreateFormData({ ...createFormData, grade: value })}>
                  <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                    <SelectValue placeholder="Chọn khối lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map(grade => (
                      <SelectItem key={grade} value={grade}>Lớp {grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="text-slate-300">Mô tả</Label>
              <Input
                id="description"
                value={createFormData.description}
                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                className="bg-slate-700/50 border-purple-500/30 text-white"
                placeholder="Nhập mô tả lớp học"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject" className="text-slate-300">Môn học</Label>
                <Select value={createFormData.subject} onValueChange={(value) => setCreateFormData({ ...createFormData, subject: value })}>
                  <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maxStudents" className="text-slate-300">Số học sinh tối đa</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={createFormData.maxStudents}
                  onChange={(e) => setCreateFormData({ ...createFormData, maxStudents: parseInt(e.target.value) || 30 })}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  placeholder="30"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={createFormData.isPublic}
                onCheckedChange={(checked) => setCreateFormData({ ...createFormData, isPublic: checked })}
              />
              <Label htmlFor="isPublic" className="text-slate-300">Lớp học công khai</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateClassroom}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={isLoading}
            >
              {isLoading ? 'Đang tạo...' : 'Tạo Lớp học'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Classroom Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Lớp học</DialogTitle>
            <DialogDescription className="text-slate-400">
              Cập nhật thông tin lớp học
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name" className="text-slate-300">Tên lớp học</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-grade" className="text-slate-300">Khối lớp</Label>
                <Select value={editFormData.grade} onValueChange={(value) => setEditFormData({ ...editFormData, grade: value })}>
                  <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                    <SelectValue placeholder="Chọn khối lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map(grade => (
                      <SelectItem key={grade} value={grade}>Lớp {grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-slate-300">Mô tả</Label>
              <Input
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="bg-slate-700/50 border-purple-500/30 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-subject" className="text-slate-300">Môn học</Label>
                <Select value={editFormData.subject} onValueChange={(value) => setEditFormData({ ...editFormData, subject: value })}>
                  <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-maxStudents" className="text-slate-300">Số học sinh tối đa</Label>
                <Input
                  id="edit-maxStudents"
                  type="number"
                  value={editFormData.maxStudents}
                  onChange={(e) => setEditFormData({ ...editFormData, maxStudents: parseInt(e.target.value) || 30 })}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isPublic"
                checked={editFormData.isPublic}
                onCheckedChange={(checked) => setEditFormData({ ...editFormData, isPublic: checked })}
              />
              <Label htmlFor="edit-isPublic" className="text-slate-300">Lớp học công khai</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleEditClassroom}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={isLoading}
            >
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Classroom Modal - Galaxy Theme */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-purple-500/30 text-white max-w-2xl shadow-2xl">
          {/* Galaxy Background Effect */}
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl"></div>
          </div>

          <div className="relative z-10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-2">
                <BookMarked className="w-6 h-6 text-purple-400" />
                Chi tiết Lớp học
              </DialogTitle>
            </DialogHeader>

            {detailClassroom && (
              <div className="space-y-6 py-4">
                {/* Header Section */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{detailClassroom.name}</h2>
                      <p className="text-slate-300 text-sm">{detailClassroom.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        detailClassroom.isPublic
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      }`}
                    >
                      {detailClassroom.isPublic ? 'Công khai' : 'Riêng tư'}
                    </Badge>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Môn học */}
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-slate-400">Môn học</span>
                    </div>
                    <p className="text-lg font-semibold text-white">{detailClassroom.subject || 'Toán học'}</p>
                  </div>

                  {/* Khối lớp */}
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-slate-400">Khối lớp</span>
                    </div>
                    <p className="text-lg font-semibold text-white">{detailClassroom.grade ? `Lớp ${detailClassroom.grade}` : 'Chưa xác định'}</p>
                  </div>

                  {/* Học sinh */}
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <UsersIcon className="w-4 h-4 text-pink-400" />
                      <span className="text-sm text-slate-400">Số học sinh</span>
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {detailClassroom.currentStudents}/{detailClassroom.maxStudents}
                    </p>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                        style={{
                          width: `${(detailClassroom.currentStudents / detailClassroom.maxStudents) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Mã tham gia */}
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-400">Mã tham gia</span>
                    </div>
                    <p className="text-lg font-mono font-bold text-yellow-300">{detailClassroom.joinCode}</p>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-800/40 rounded-lg p-3 border border-blue-500/20 text-center">
                    <BarChart3 className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-white">{detailClassroom.assignmentCount || 0}</p>
                    <p className="text-xs text-slate-400">Bài tập</p>
                  </div>

                  <div className="bg-slate-800/40 rounded-lg p-3 border border-green-500/20 text-center">
                    <BookMarked className="w-4 h-4 text-green-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-white">{detailClassroom.quizCount || 0}</p>
                    <p className="text-xs text-slate-400">Quiz</p>
                  </div>

                  <div className="bg-slate-800/40 rounded-lg p-3 border border-purple-500/20 text-center">
                    <Info className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-white">{detailClassroom.contentCount || 0}</p>
                    <p className="text-xs text-slate-400">Nội dung</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-slate-800/40 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400">Ngày tạo</span>
                    </div>
                    <span className="text-white">{new Date(detailClassroom.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {detailClassroom.updatedAt && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Cập nhật lần cuối</span>
                      </div>
                      <span className="text-white">{new Date(detailClassroom.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={() => setIsDetailDialogOpen(false)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Đóng
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
