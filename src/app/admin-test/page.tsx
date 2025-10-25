'use client';

import { useAuth } from '@/context/auth-context';
import { isAdmin } from '@/lib/role-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Crown, User, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AdminTestPage() {
  const { role, roleId, email } = useAuth();
  const isUserAdmin = isAdmin(role, roleId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Admin Header Test Page
          </h1>
          <p className="text-purple-200 text-lg">
            Kiểm tra tính năng Admin Dashboard trong header
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Thông tin User
              </CardTitle>
              <CardDescription className="text-slate-400">
                Thông tin tài khoản hiện tại
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Email:</span>
                <span className="text-white">{email || 'Chưa đăng nhập'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Role String:</span>
                <span className="text-white">{role || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Role ID:</span>
                <span className="text-white">{roleId || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Is Admin:</span>
                <Badge 
                  variant="outline" 
                  className={isUserAdmin ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}
                >
                  {isUserAdmin ? 'Yes' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Admin Features
              </CardTitle>
              <CardDescription className="text-slate-400">
                Tính năng admin có sẵn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isUserAdmin ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-green-400">Admin Dashboard trong header</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-blue-400" />
                    <span className="text-green-400">Quick Access Menu</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-green-400">Admin Badge</span>
                  </div>
                  <Link href="/admin">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      <Shield className="w-4 h-4 mr-2" />
                      Truy cập Admin Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-slate-400 mb-4">
                    Bạn cần đăng nhập với tài khoản Admin để xem các tính năng này
                  </p>
                  <Link href="/auth/login">
                    <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                      Đăng nhập
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Hướng dẫn sử dụng</CardTitle>
            <CardDescription className="text-slate-400">
              Cách kiểm tra tính năng Admin Dashboard trong header
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <div>
                  <p className="text-white font-medium">Đăng nhập với tài khoản Admin</p>
                  <p className="text-slate-400 text-sm">Role ID = 1 hoặc Role = "ADMIN"</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <div>
                  <p className="text-white font-medium">Kiểm tra header navigation</p>
                  <p className="text-slate-400 text-sm">Bạn sẽ thấy "Admin" button với dropdown menu</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <div>
                  <p className="text-white font-medium">Test trên mobile</p>
                  <p className="text-slate-400 text-sm">Mở menu hamburger để xem admin options</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
