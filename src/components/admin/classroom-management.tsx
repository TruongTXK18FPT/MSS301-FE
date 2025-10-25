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
  GraduationCap
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
import { Switch } from '@/components/ui/switch';

// Mock data
const mockClassrooms = [
  {
    id: 1,
    name: 'Toán 12 - Lớp A1',
    description: 'Lớp học toán nâng cao cho học sinh lớp 12',
    owner: 'Trần Thị Bình',
    ownerEmail: 'binh.tran@example.com',
    isPublic: true,
    joinCode: 'MATH12A1',
    maxStudents: 30,
    currentStudents: 25,
    subject: 'Toán học',
    grade: '12',
    createdAt: '2024-01-15',
    status: 'active'
  },
  {
    id: 2,
    name: 'Vật Lý 11 - Lớp B2',
    description: 'Lớp học vật lý cơ bản',
    owner: 'Nguyễn Văn Cường',
    ownerEmail: 'cuong.nguyen@example.com',
    isPublic: false,
    joinCode: 'PHY11B2',
    maxStudents: 25,
    currentStudents: 20,
    subject: 'Vật lý',
    grade: '11',
    createdAt: '2024-01-10',
    status: 'active'
  },
  {
    id: 3,
    name: 'Hóa học 10 - Lớp C3',
    description: 'Lớp học hóa học cơ bản',
    owner: 'Lê Thị Dung',
    ownerEmail: 'dung.le@example.com',
    isPublic: true,
    joinCode: 'CHEM10C3',
    maxStudents: 35,
    currentStudents: 30,
    subject: 'Hóa học',
    grade: '10',
    createdAt: '2024-01-08',
    status: 'active'
  },
  {
    id: 4,
    name: 'Sinh học 12 - Lớp D4',
    description: 'Lớp học sinh học nâng cao',
    owner: 'Phạm Văn Em',
    ownerEmail: 'em.pham@example.com',
    isPublic: false,
    joinCode: 'BIO12D4',
    maxStudents: 28,
    currentStudents: 15,
    subject: 'Sinh học',
    grade: '12',
    createdAt: '2024-01-05',
    status: 'inactive'
  }
];

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
  '6', '7', '8', '9', '10', '11', '12'
];

export default function ClassroomManagement() {
  const [classrooms, setClassrooms] = useState(mockClassrooms);
  const [filteredClassrooms, setFilteredClassrooms] = useState(mockClassrooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null);

  // Filter classrooms
  useEffect(() => {
    let filtered = classrooms;

    if (searchTerm) {
      filtered = filtered.filter(classroom => 
        classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classroom.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classroom.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(classroom => classroom.subject === subjectFilter);
    }

    if (gradeFilter !== 'all') {
      filtered = filtered.filter(classroom => classroom.grade === gradeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(classroom => classroom.status === statusFilter);
    }

    setFilteredClassrooms(filtered);
  }, [classrooms, searchTerm, subjectFilter, gradeFilter, statusFilter]);

  const handleDeleteClassroom = (classroomId: number) => {
    setClassrooms(classrooms.filter(classroom => classroom.id !== classroomId));
  };

  const handleToggleStatus = (classroomId: number) => {
    setClassrooms(classrooms.map(classroom => 
      classroom.id === classroomId 
        ? { ...classroom, status: classroom.status === 'active' ? 'inactive' : 'active' }
        : classroom
    ));
  };

  const handleTogglePublic = (classroomId: number) => {
    setClassrooms(classrooms.map(classroom => 
      classroom.id === classroomId 
        ? { ...classroom, isPublic: !classroom.isPublic }
        : classroom
    ));
  };

  const handleCreateClassroom = (classroomData: any) => {
    const newClassroom = {
      id: Math.max(...classrooms.map(c => c.id)) + 1,
      ...classroomData,
      joinCode: `CLASS${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      currentStudents: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setClassrooms([...classrooms, newClassroom]);
    setIsCreateDialogOpen(false);
  };

  const handleEditClassroom = (classroomData: any) => {
    setClassrooms(classrooms.map(classroom => 
      classroom.id === selectedClassroom.id 
        ? { ...classroom, ...classroomData }
        : classroom
    ));
    setIsEditDialogOpen(false);
    setSelectedClassroom(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
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
          onClick={() => setIsCreateDialogOpen(true)}
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
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
            Hiển thị {filteredClassrooms.length} trong tổng số {classrooms.length} lớp học
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-purple-500/20">
                <TableHead className="text-slate-300">Lớp học</TableHead>
                <TableHead className="text-slate-300">Giáo viên</TableHead>
                <TableHead className="text-slate-300">Môn học</TableHead>
                <TableHead className="text-slate-300">Học sinh</TableHead>
                <TableHead className="text-slate-300">Trạng thái</TableHead>
                <TableHead className="text-slate-300">Công khai</TableHead>
                <TableHead className="text-slate-300">Ngày tạo</TableHead>
                <TableHead className="text-slate-300">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClassrooms.map((classroom) => (
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
                      <p className="font-medium text-white">{classroom.owner}</p>
                      <p className="text-sm text-slate-400">{classroom.ownerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <Badge 
                        variant="outline" 
                        className={getSubjectColor(classroom.subject)}
                      >
                        {classroom.subject}
                      </Badge>
                      <span className="text-xs text-slate-400">Lớp {classroom.grade}</span>
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
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(classroom.status)}
                    >
                      {classroom.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
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
                          onClick={() => {
                            setSelectedClassroom(classroom);
                            setIsEditDialogOpen(true);
                          }}
                          className="text-slate-300 hover:bg-purple-500/20 hover:text-white"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(classroom.id)}
                          className="text-slate-300 hover:bg-purple-500/20 hover:text-white"
                        >
                          {classroom.status === 'active' ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Vô hiệu hóa
                            </>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4 mr-2" />
                              Kích hoạt
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 hover:bg-purple-500/20 hover:text-white">
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
              ))}
            </TableBody>
          </Table>
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
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  placeholder="Nhập tên lớp học"
                />
              </div>
              <div>
                <Label htmlFor="grade" className="text-slate-300">Khối lớp</Label>
                <Select>
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
                className="bg-slate-700/50 border-purple-500/30 text-white"
                placeholder="Nhập mô tả lớp học"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject" className="text-slate-300">Môn học</Label>
                <Select>
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
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  placeholder="30"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isPublic" />
              <Label htmlFor="isPublic" className="text-slate-300">Lớp học công khai</Label>
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
              onClick={() => handleCreateClassroom({})}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Tạo Lớp học
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
                  defaultValue={selectedClassroom?.name}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-grade" className="text-slate-300">Khối lớp</Label>
                <Select defaultValue={selectedClassroom?.grade}>
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
                defaultValue={selectedClassroom?.description}
                className="bg-slate-700/50 border-purple-500/30 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-subject" className="text-slate-300">Môn học</Label>
                <Select defaultValue={selectedClassroom?.subject}>
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
                  defaultValue={selectedClassroom?.maxStudents}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="edit-isPublic" 
                defaultChecked={selectedClassroom?.isPublic}
              />
              <Label htmlFor="edit-isPublic" className="text-slate-300">Lớp học công khai</Label>
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
              onClick={() => handleEditClassroom({})}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
