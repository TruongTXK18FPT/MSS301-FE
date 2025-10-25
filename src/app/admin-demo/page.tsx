'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  GraduationCap, 
  Building2, 
  CreditCard,
  ArrowRight,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDemoPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    // Simulate admin login
    setTimeout(() => {
      window.location.href = '/admin';
    }, 1000);
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Đang đăng nhập...</h2>
          <p className="text-purple-200">Chuyển hướng đến Admin Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Galaxy Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }, (_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            MathMind Admin Dashboard
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Hệ thống quản lý toàn diện với giao diện galaxy theme chuyên nghiệp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg"
            >
              <Star className="w-5 h-5 mr-2" />
              Demo Admin Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Link href="/auth/login">
              <Button 
                variant="outline" 
                size="lg"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 px-8 py-3 text-lg"
              >
                Đăng nhập thực tế
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white">Analytics Dashboard</CardTitle>
              <CardDescription className="text-slate-400">
                Thống kê và phân tích chi tiết với biểu đồ đẹp mắt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Tracking traffic real-time</li>
                <li>• Biểu đồ tăng trưởng users</li>
                <li>• Phân tích hiệu suất hệ thống</li>
                <li>• Báo cáo chi tiết</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white">Quản lý Users</CardTitle>
              <CardDescription className="text-slate-400">
                Quản lý người dùng với đầy đủ tính năng CRUD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Tạo, sửa, xóa users</li>
                <li>• Phân quyền theo role</li>
                <li>• Quản lý trạng thái</li>
                <li>• Tìm kiếm và lọc</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white">Quản lý Lớp học</CardTitle>
              <CardDescription className="text-slate-400">
                Quản lý các lớp học và môn học
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Tạo và quản lý lớp học</li>
                <li>• Phân loại theo môn học</li>
                <li>• Quản lý học sinh</li>
                <li>• Thiết lập quyền riêng tư</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white">Quản lý Tenant</CardTitle>
              <CardDescription className="text-slate-400">
                Quản lý các tổ chức và đơn vị
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Quản lý tổ chức</li>
                <li>• Phân quyền theo tenant</li>
                <li>• Theo dõi sử dụng</li>
                <li>• Cấu hình riêng</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-purple-400" />
                Quản lý Subscription
              </CardTitle>
              <CardDescription className="text-slate-400">
                Quản lý các gói đăng ký và thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Gói Basic</span>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                    Miễn phí
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Gói Premium</span>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                    $29.99/tháng
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Gói Enterprise</span>
                  <Badge variant="outline" className="border-green-500/30 text-green-400">
                    $99.99/tháng
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Tính năng nổi bật</CardTitle>
              <CardDescription className="text-slate-400">
                Những tính năng độc đáo của admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-slate-300">Giao diện Galaxy theme chuyên nghiệp</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300">Responsive design cho mọi thiết bị</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">Biểu đồ tương tác với Recharts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-slate-300">Quản lý quyền truy cập chi tiết</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-slate-300">Tìm kiếm và lọc thông minh</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="text-lg text-purple-200 mb-8">
            Khám phá admin dashboard với đầy đủ tính năng quản lý
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-xl"
          >
            <Star className="w-6 h-6 mr-3" />
            Bắt đầu Demo ngay
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
