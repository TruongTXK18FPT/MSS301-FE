'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  GraduationCap,
  Award,
  Briefcase,
  Edit,
  Settings,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Clock
} from "lucide-react";
import { authService } from '@/lib/services/auth.service';
import { profileApi } from '@/lib/services/axios';
import { UserResponse } from '@/lib/dto';
import { requireAuth } from '@/lib/auth-utils';

interface TeacherProfileResponse {
  id: number;
  userId: number;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  department?: string;
  specialization?: string;
  yearsOfExperience?: number;
  qualifications?: string;
  bio?: string;
  approvalStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TeacherProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [profile, setProfile] = useState<TeacherProfileResponse | null>(null);
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

      // Load teacher profile
      try {
        const response = await profileApi.get('/me/teacher');
        if (response.data.code === 1000) {
          setProfile(response.data.result);
        }
      } catch (err: any) {
        console.log('Teacher profile error:', err);
        if (err.response?.status === 404) {
          console.log('Teacher profile not found, may need to complete registration');
        }
        setError('Không thể tải thông tin profile');
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
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  const getApprovalStatusBadge = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Chờ duyệt</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="border-green-500 text-green-500">Đã được duyệt</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="border-red-500 text-red-500">Đã bị từ chối</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-500 text-gray-500">Không xác định</Badge>;
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
        <Card className="w-full max-w-md bg-black/30 backdrop-blur-xl border border-purple-500/30">
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
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl">
                  {user?.username?.charAt(0).toUpperCase() || 'T'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {profile?.fullName || user?.username || 'Giáo viên'}
                </h1>
                <p className="text-purple-200">{user?.email || profile?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
                    TEACHER
                  </Badge>
                  {profile && getApprovalStatusBadge(profile.approvalStatus)}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <Settings className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>

        {/* Teacher-specific information cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/30 backdrop-blur-xl border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-purple-400" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-purple-200">Email:</span>
                <span className="text-white">{user?.email || profile?.email || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Số điện thoại:</span>
                <span className="text-white">{profile?.phoneNumber || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Địa chỉ:</span>
                <span className="text-white">{profile?.address || 'Chưa cập nhật'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 backdrop-blur-xl border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-cyan-400" />
                Chuyên môn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-cyan-200">Tổ/Bộ môn:</span>
                <span className="text-white">{profile?.department || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-200">Chuyên môn:</span>
                <span className="text-white">{profile?.specialization || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-200">Kinh nghiệm:</span>
                <span className="text-white">{profile?.yearsOfExperience || 0} năm</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Qualifications and Bio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {profile?.qualifications && (
            <Card className="bg-black/30 backdrop-blur-xl border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Award className="h-5 w-5 mr-2 text-green-400" />
                  Trình độ/Chứng chỉ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-200 whitespace-pre-wrap">
                  {profile.qualifications}
                </p>
              </CardContent>
            </Card>
          )}

          {profile?.bio && (
            <Card className="bg-black/30 backdrop-blur-xl border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-pink-400" />
                  Giới thiệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-pink-200 whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          <Button 
            onClick={() => router.push('/profile/change-password')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
          >
            <Lock className="h-4 w-4 mr-2" />
            Thay đổi mật khẩu
          </Button>
        </div>

        {/* Approval Status Notice */}
        {profile?.approvalStatus === 'PENDING' && (
          <Card className="mt-6 bg-yellow-900/20 backdrop-blur-xl border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-yellow-400" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-300">Đang chờ duyệt</h3>
                  <p className="text-yellow-200 text-sm">
                    Đơn đăng ký giáo viên của bạn đang được quản trị viên xem xét. Bạn sẽ nhận được email khi có kết quả.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

