'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Brain, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Edit,
  Settings,
  Plus,
  Eye,
  Share2,
  Heart
} from "lucide-react";
import { authService, profileService, mindmapService, classroomService } from '@/lib/services';
import { UserResponse, StudentProfileResponse, MindmapResponse, ClassroomResponse, Assignment } from '@/lib/dto';
import { requireAuth } from '@/lib/auth';

export default function ProfilePage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [profile, setProfile] = useState<StudentProfileResponse | null>(null);
  const [mindmaps, setMindmaps] = useState<MindmapResponse[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomResponse[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra authentication trước khi load data
    if (!requireAuth()) {
      return;
    }
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user info
      const userData = authService.getCurrentUserFromStorage();
      if (!userData) {
        globalThis.location.href = '/auth/login';
        return;
      }
      setUser(userData);

      // Load profile
      try {
        const profileData = await profileService.getCurrentProfile();
        setProfile(profileData);
      } catch (err) {
        console.log('Profile not found, user needs to complete profile');
        // Continue without profile data - this is expected for new users
      }

      // Load mindmaps
      try {
        const mindmapsData = await mindmapService.getUserMindmaps();
        setMindmaps(mindmapsData);
      } catch (err) {
        console.log('No mindmaps found');
        // Continue without mindmaps data - user may not have created any yet
      }

      // Load classrooms
      try {
        const classroomsData = await classroomService.getMyClassrooms();
        setClassrooms(classroomsData);
      } catch (err) {
        console.log('No classrooms found');
        // Continue without classrooms data - user may not have joined any yet
      }

      // Load upcoming assignments
      try {
        const assignmentsData = await classroomService.getUpcomingDeadlines(7);
        setAssignments(assignmentsData);
      } catch (err) {
        console.log('No assignments found');
        // Continue without assignments data - user may not have any assignments yet
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    } catch (err) {
      console.error('Logout error:', err);
      // Still redirect even if logout fails
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button onClick={loadUserData} className="mt-4">
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xl">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {profile?.fullName || user?.username || 'Người dùng'}
                </h1>
                <p className="text-purple-200">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
                    {profile?.userType || 'STUDENT'}
                  </Badge>
                  {profile?.profileCompleted ? (
                    <Badge variant="outline" className="border-green-500 text-green-400">
                      Đã hoàn thành profile
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                      Chưa hoàn thành profile
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <Settings className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/30 backdrop-blur-xl border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Mindmaps</CardTitle>
              <Brain className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{mindmaps.length}</div>
              <p className="text-xs text-purple-200">
                {mindmaps.filter(m => m.isAiGenerated).length} được tạo bởi AI
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 backdrop-blur-xl border-cyan-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-200">Lớp học</CardTitle>
              <BookOpen className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{classrooms.length}</div>
              <p className="text-xs text-cyan-200">
                {classrooms.filter(c => c.isPublic).length} công khai
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 backdrop-blur-xl border-pink-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-200">Bài tập</CardTitle>
              <Calendar className="h-4 w-4 text-pink-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{assignments.length}</div>
              <p className="text-xs text-pink-200">
                Deadline sắp tới
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 backdrop-blur-xl border-green-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-200">Tổng truy cập</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {mindmaps.reduce((sum, m) => sum + m.accessCount, 0)}
              </div>
              <p className="text-xs text-green-200">
                Lượt xem mindmaps
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="mindmaps" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 backdrop-blur-xl">
            <TabsTrigger value="mindmaps" className="data-[state=active]:bg-purple-500/20">
              Mindmaps
            </TabsTrigger>
            <TabsTrigger value="classrooms" className="data-[state=active]:bg-cyan-500/20">
              Lớp học
            </TabsTrigger>
            <TabsTrigger value="assignments" className="data-[state=active]:bg-pink-500/20">
              Bài tập
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-green-500/20">
              Thông tin
            </TabsTrigger>
          </TabsList>

          {/* Mindmaps Tab */}
          <TabsContent value="mindmaps" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Mindmaps của tôi</h2>
              <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400">
                <Plus className="h-4 w-4 mr-2" />
                Tạo mới
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mindmaps.map((mindmap) => (
                <Card key={mindmap.id} className="bg-black/30 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{mindmap.title}</CardTitle>
                      {mindmap.isAiGenerated && (
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
                          AI
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-purple-200">
                      {mindmap.description || 'Không có mô tả'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-purple-200 mb-4">
                      <span>{mindmap.grade} - {mindmap.subject}</span>
                      <span>{new Date(mindmap.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4 text-sm text-purple-200">
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {mindmap.accessCount}
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {mindmap.favoriteCount}
                        </span>
                        <span className="flex items-center">
                          <Share2 className="h-4 w-4 mr-1" />
                          {mindmap.shareCount}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Classrooms Tab */}
          <TabsContent value="classrooms" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Lớp học của tôi</h2>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400">
                <Plus className="h-4 w-4 mr-2" />
                Tạo lớp học
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map((classroom) => (
                <Card key={classroom.id} className="bg-black/30 backdrop-blur-xl border-cyan-500/30 hover:border-cyan-400/50 transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{classroom.name}</CardTitle>
                      {classroom.isPublic && (
                        <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-200">
                          Công khai
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-cyan-200">
                      {classroom.description || 'Không có mô tả'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-cyan-200 mb-4">
                      <div className="flex justify-between">
                        <span>Lớp:</span>
                        <span>{classroom.grade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Môn:</span>
                        <span>{classroom.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Học sinh:</span>
                        <span>{classroom.currentStudents}/{classroom.maxStudents || '∞'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-cyan-200">
                        Tạo: {new Date(classroom.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <Button size="sm" variant="outline">
                        Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Bài tập sắp đến hạn</h2>
            
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="bg-black/30 backdrop-blur-xl border-pink-500/30 hover:border-pink-400/50 transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{assignment.title}</CardTitle>
                      <Badge variant="outline" className="border-pink-500 text-pink-400">
                        {assignment.points} điểm
                      </Badge>
                    </div>
                    <CardDescription className="text-pink-200">
                      {assignment.description || 'Không có mô tả'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-pink-200">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Hạn: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(assignment.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-500">
                        Làm bài
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Thông tin cá nhân</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/30 backdrop-blur-xl border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-green-200">Họ tên:</span>
                    <span className="text-white">{profile?.fullName || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-200">Email:</span>
                    <span className="text-white">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-200">Số điện thoại:</span>
                    <span className="text-white">{profile?.phoneNumber || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-200">Ngày sinh:</span>
                    <span className="text-white">{profile?.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-200">Địa chỉ:</span>
                    <span className="text-white">{profile?.address || 'Chưa cập nhật'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-xl border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Giới thiệu</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-200">
                    {profile?.bio || 'Chưa có giới thiệu về bản thân'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
