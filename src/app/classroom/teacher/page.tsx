'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Plus,
  Search,
  Settings,
  BarChart3,
  FileText,
  Clock,
  TrendingUp,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { usePermissions } from '@/hooks/use-permissions';
import { classroomService } from '@/services/classroom.service';
import { Classroom, Assignment, Quiz } from '@/types/classroom';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function TeacherDashboard() {
  const { canCreateClassroom } = usePermissions();
  const { toast } = useToast();
  
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classroomsData, assignmentsData, quizzesData] = await Promise.all([
        classroomService.getMyClassrooms(),
        // Load assignments and quizzes for all classrooms
        Promise.resolve([]), // Will be implemented later
        Promise.resolve([])  // Will be implemented later
      ]);
      
      setClassrooms(classroomsData);
      setAssignments(assignmentsData);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClassroom = async (id: number) => {
    try {
      await classroomService.deleteClassroom(id);
      setClassrooms(classrooms.filter(c => c.id !== id));
      toast({
        title: "Thành công",
        description: "Đã xóa lớp học thành công."
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa lớp học. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const filteredClassrooms = classrooms.filter(classroom =>
    classroom.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    classroom.description?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-blue-900/20 to-indigo-900/20"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse">
                <GraduationCap className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 animate-gradient">
                  Bảng điều khiển Giáo viên
                </h1>
                <p className="text-emerald-200/80">Quản lý lớp học và bài tập</p>
              </div>
            </div>
            {canCreateClassroom && (
              <Link href="/classroom/create">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl">
                  <Plus className="size-4 mr-2" />
                  Tạo lớp học
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-200/70 text-sm">Tổng lớp học</p>
                  <p className="text-2xl font-bold text-white">{classrooms.length}</p>
                </div>
                <GraduationCap className="size-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-teal-500/30 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200/70 text-sm">Tổng học sinh</p>
                  <p className="text-2xl font-bold text-white">
                    {classrooms.reduce((sum, c) => sum + c.currentStudents, 0)}
                  </p>
                </div>
                <Users className="size-8 text-teal-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200/70 text-sm">Bài tập</p>
                  <p className="text-2xl font-bold text-white">{assignments.length}</p>
                </div>
                <FileText className="size-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200/70 text-sm">Kiểm tra</p>
                  <p className="text-2xl font-bold text-white">{quizzes.length}</p>
                </div>
                <Clock className="size-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 size-4" />
            <Input
              placeholder="Tìm kiếm lớp học..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-10 bg-black/40 border-emerald-400/30 text-white rounded-xl backdrop-blur-sm focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Classrooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((classroom) => (
            <Card key={classroom.id} className="bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{classroom.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="bg-black/30 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/20">
                      <Eye className="size-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-black/30 border-blue-400/30 text-blue-200 hover:bg-blue-500/20">
                      <Edit className="size-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-black/30 border-red-400/30 text-red-200 hover:bg-red-500/20"
                      onClick={() => handleDeleteClassroom(classroom.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-emerald-200/70 text-sm">{classroom.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-200/70 text-sm">Học sinh:</span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                      {classroom.currentStudents}/{classroom.maxStudents}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-200/70 text-sm">Trạng thái:</span>
                    <Badge className={`${
                      classroom.isPublic 
                        ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                        : 'bg-orange-500/20 text-orange-300 border-orange-400/30'
                    }`}>
                      {classroom.isPublic ? 'Công khai' : 'Riêng tư'}
                    </Badge>
                  </div>

                  {classroom.password && (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-200/70 text-sm">Mật khẩu:</span>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                        Được bảo vệ
                      </Badge>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Link href={`/classroom/${classroom.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/30">
                        <BarChart3 className="size-4 mr-2" />
                        Quản lý
                      </Button>
                    </Link>
                    <Link href={`/classroom/${classroom.id}/assignments`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-200 hover:bg-blue-500/30">
                        <FileText className="size-4 mr-2" />
                        Bài tập
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClassrooms.length === 0 && (
          <Card className="bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-xl">
            <CardContent className="p-8 text-center">
              <GraduationCap className="size-16 text-emerald-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">Chưa có lớp học nào</h3>
              <p className="text-emerald-200/70 mb-4">Tạo lớp học đầu tiên để bắt đầu quản lý học sinh</p>
              {canCreateClassroom && (
                <Link href="/classroom/create">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl">
                    <Plus className="size-4 mr-2" />
                    Tạo lớp học
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
