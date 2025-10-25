'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Search,
  Plus,
  Users,
  FileText,
  Clock,
  Lock,
  Eye,
  Calendar,
  TrendingUp
} from "lucide-react";
import { usePermissions } from '@/hooks/use-permissions';
import { classroomService } from '@/lib/services/classroom.service';
import { Classroom, Assignment, Quiz } from '@/types/classroom';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function StudentDashboard() {
  const { canJoinClassrooms } = usePermissions();
  const { toast } = useToast();
  
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinData, setJoinData] = useState({ classroomCode: '', password: '' });

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

  const handleJoinClassroom = async () => {
    try {
      const classroom = await classroomService.joinClassroom(joinData);
      setClassrooms([...classrooms, classroom]);
      setShowJoinForm(false);
      setJoinData({ classroomCode: '', password: '' });
      toast({
        title: "Thành công",
        description: "Đã tham gia lớp học thành công."
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tham gia lớp học. Vui lòng kiểm tra mã lớp và mật khẩu.",
        variant: "destructive"
      });
    }
  };

  const searchClassrooms = async () => {
    if (!searchKeyword.trim()) return;
    
    try {
      const results = await classroomService.searchClassrooms(searchKeyword);
      // Handle search results - could show in a modal or separate section
      console.log('Search results:', results);
    } catch (error) {
      console.error('Error searching classrooms:', error);
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse">
                <BookOpen className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
                  Lớp học của tôi
                </h1>
                <p className="text-blue-200/80">Tham gia lớp học và làm bài tập</p>
              </div>
            </div>
            {canJoinClassrooms && (
              <Button 
                onClick={() => setShowJoinForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white rounded-xl"
              >
                <Plus className="size-4 mr-2" />
                Tham gia lớp
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200/70 text-sm">Lớp học</p>
                  <p className="text-2xl font-bold text-white">{classrooms.length}</p>
                </div>
                <BookOpen className="size-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200/70 text-sm">Bài tập</p>
                  <p className="text-2xl font-bold text-white">{assignments.length}</p>
                </div>
                <FileText className="size-8 text-green-400" />
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

          <Card className="bg-black/40 backdrop-blur-xl border border-orange-500/30 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200/70 text-sm">Tiến độ</p>
                  <p className="text-2xl font-bold text-white">85%</p>
                </div>
                <TrendingUp className="size-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Join */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 size-4" />
            <Input
              placeholder="Tìm kiếm lớp học..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-10 bg-black/40 border-blue-400/30 text-white rounded-xl backdrop-blur-sm focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <Button 
            onClick={searchClassrooms}
            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-blue-200 hover:bg-blue-500/30"
          >
            <Search className="size-4 mr-2" />
            Tìm kiếm
          </Button>
        </div>

        {/* Join Classroom Modal */}
        {showJoinForm && (
          <Card className="mb-6 bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="size-5 text-blue-400" />
                Tham gia lớp học
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-blue-200 text-sm mb-2 block">Mã lớp học</label>
                  <Input
                    placeholder="Nhập mã lớp học"
                    value={joinData.classroomCode}
                    onChange={(e) => setJoinData({...joinData, classroomCode: e.target.value})}
                    className="bg-black/40 border-blue-400/30 text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-blue-200 text-sm mb-2 block">Mật khẩu</label>
                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu lớp học"
                    value={joinData.password}
                    onChange={(e) => setJoinData({...joinData, password: e.target.value})}
                    className="bg-black/40 border-blue-400/30 text-white rounded-xl"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleJoinClassroom}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white"
                  >
                    Tham gia
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowJoinForm(false)}
                    className="bg-black/30 border-blue-400/30 text-blue-200 hover:bg-blue-500/20"
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Classrooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((classroom) => (
            <Card key={classroom.id} className="bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{classroom.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={`${
                      classroom.isPublic 
                        ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                        : 'bg-orange-500/20 text-orange-300 border-orange-400/30'
                    }`}>
                      {classroom.isPublic ? 'Công khai' : 'Riêng tư'}
                    </Badge>
                    {classroom.password && (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                        <Lock className="size-3 mr-1" />
                        Bảo vệ
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-blue-200/70 text-sm">{classroom.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200/70 text-sm">Học sinh:</span>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                      {classroom.currentStudents}/{classroom.maxStudents}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200/70 text-sm">Tham gia:</span>
                    <span className="text-blue-200/70 text-sm">
                      {new Date(classroom.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/classroom/${classroom.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-blue-200 hover:bg-blue-500/30">
                        <Eye className="size-4 mr-2" />
                        Vào lớp
                      </Button>
                    </Link>
                    <Link href={`/classroom/${classroom.id}/assignments`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-400/30 text-green-200 hover:bg-green-500/30">
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
          <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-xl">
            <CardContent className="p-8 text-center">
              <BookOpen className="size-16 text-blue-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">Chưa tham gia lớp học nào</h3>
              <p className="text-blue-200/70 mb-4">Tìm kiếm và tham gia lớp học để bắt đầu học tập</p>
              {canJoinClassrooms && (
                <Button 
                  onClick={() => setShowJoinForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white rounded-xl"
                >
                  <Plus className="size-4 mr-2" />
                  Tham gia lớp học
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
