'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Heart,
  Lock,
  Users,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon
} from "lucide-react";
import { authService } from '@/lib/services/auth.service';
import { profileService } from '@/lib/services';
import { UserResponse, GuardianProfileResponse, GuardianProfileWithStudents } from '@/lib/dto';
import { requireAuth } from '@/lib/auth-utils';
import AddStudentModal from '@/components/AddStudentModal';

export default function GuardianProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [profile, setProfile] = useState<GuardianProfileWithStudents | null>(null);
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
      
      // Load user info from localStorage (no API call needed)
      const userFromStorage = authService.getCurrentUserFromStorage();
      if (userFromStorage) {
        setUser(userFromStorage);
      }
      
      // Load guardian profile with students
      const profileResponse = await profileService.getGuardianProfileWithStudents();
      setProfile(profileResponse);
      
    } catch (error: any) {
      console.error('Error loading guardian profile:', error);
      setError(error.message || 'Có lỗi xảy ra khi tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentAdded = () => {
    // Reload profile data when student is added
    loadUserData();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải thông tin profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/30 backdrop-blur-xl border-red-500/30">
          <CardContent className="p-6 text-center">
            <div className="text-red-200 mb-4">{error}</div>
            <Button onClick={() => window.location.reload()} className="bg-red-500 hover:bg-red-600">
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-purple-500/30 p-6 mb-8">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20 border-2 border-purple-500/30">
              <AvatarImage src={profile?.avatarUrl} />
              <AvatarFallback className="bg-purple-500/20 text-white text-xl">
                {profile?.fullName?.charAt(0)?.toUpperCase() || 'G'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {profile?.fullName || 'Guardian Profile'}
                </h1>
                <Badge variant="secondary" className="bg-green-500/20 text-green-200 border-green-500/30">
                  GUARDIAN
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-purple-200">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{profile?.userId && user?.email}</span>
                </div>
                {profile?.phoneNumber && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{profile.phoneNumber}</span>
                  </div>
                )}
                {profile?.relationship && (
                  <div className="flex items-center space-x-1">
                    <UserCheck className="w-4 h-4" />
                    <span>{profile.relationship}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/30 backdrop-blur-xl border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Học sinh quản lý</p>
                  <p className="text-3xl font-bold text-white">{profile?.students?.length || 0}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 backdrop-blur-xl border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Mindmaps tổng</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 backdrop-blur-xl border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Lớp học</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 backdrop-blur-xl border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Tổng truy cập</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students Section */}
          <div className="lg:col-span-2">
            <Card className="bg-black/30 backdrop-blur-xl border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Học sinh được quản lý</span>
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Danh sách các học sinh mà bạn đang quản lý
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile?.students && profile.students.length > 0 ? (
                  <div className="space-y-4">
                    {profile.students.map((student: any, index: number) => (
                      <div key={index} className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={student.avatarUrl} />
                              <AvatarFallback className="bg-blue-500/20 text-white">
                                {student.fullName?.charAt(0)?.toUpperCase() || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-white font-medium">{student.fullName}</h3>
                              <p className="text-purple-200 text-sm">{student.email}</p>
                              {student.school && (
                                <p className="text-purple-300 text-xs">{student.school} - {student.grade}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20">
                              <Eye className="w-4 h-4 mr-1" />
                              Xem
                            </Button>
                            <Button size="sm" variant="outline" className="border-green-500/30 text-green-200 hover:bg-green-500/20">
                              <Share2 className="w-4 h-4 mr-1" />
                              Quản lý
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-purple-200 mb-4">Chưa có học sinh nào được quản lý</p>
                    <AddStudentModal onStudentAdded={handleStudentAdded} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Info */}
          <div>
            <Card className="bg-black/30 backdrop-blur-xl border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-200">Email:</span>
                    <span className="text-white">{user?.email}</span>
                  </div>
                  
                  {profile?.phoneNumber && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-200">Số điện thoại:</span>
                      <span className="text-white">{profile.phoneNumber}</span>
                    </div>
                  )}
                  
                  {profile?.dob && (
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-200">Ngày sinh:</span>
                      <span className="text-white">{new Date(profile.dob).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  
                  {profile?.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-200">Địa chỉ:</span>
                      <span className="text-white">{profile.address}</span>
                    </div>
                  )}
                  
                  {profile?.relationship && (
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-200">Mối quan hệ:</span>
                      <span className="text-white">{profile.relationship}</span>
                    </div>
                  )}
                </div>

                {profile?.bio && (
                  <div className="mt-6">
                    <h4 className="text-white font-medium mb-2">Giới thiệu</h4>
                    <p className="text-purple-200 text-sm">{profile.bio}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-purple-500/20">
                  <Button 
                    onClick={() => router.push('/profile/change-password')}
                    variant="outline" 
                    className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Thay đổi mật khẩu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
