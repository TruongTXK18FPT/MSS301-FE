'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthAPI } from '@/lib/services/auth.service';
import { useAuth } from '@/context/auth-context';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { email } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [checkingPasswordSetup, setCheckingPasswordSetup] = useState(true);

  // Check if user needs to setup password first
  useEffect(() => {
    const checkPasswordSetup = async () => {
      if (!email) {
        setCheckingPasswordSetup(false);
        return;
      }

      try {
        const response = await AuthAPI.getPasswordSetupStatus(email);
        if (response.code === 1000 && response.result === true) {
          // User needs to setup password first
          setError('Bạn chưa thiết lập mật khẩu. Vui lòng thiết lập mật khẩu trước khi thay đổi.');
          setTimeout(() => {
            router.push('/auth/setup-password');
          }, 2000);
        }
      } catch (error) {
        console.error('Failed to check password setup status:', error);
      } finally {
        setCheckingPasswordSetup(false);
      }
    };

    checkPasswordSetup();
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (currentPassword === newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    console.log('Change password form data:', {
      email,
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword
    });

    setLoading(true);

    try {
      await AuthAPI.changePassword({
        currentPassword,
        newPassword
      });
      
      // Redirect to profile after successful password change
      router.push('/profile');
    } catch (error: any) {
      const errorMessage = error.message || 'Có lỗi xảy ra khi thay đổi mật khẩu';
      
      // Check if user needs to setup password first
      if (errorMessage.includes('No password set') || errorMessage.includes('setup your password first')) {
        setError('Bạn chưa thiết lập mật khẩu. Vui lòng thiết lập mật khẩu trước khi thay đổi.');
        // Optionally redirect to setup password page after a delay
        setTimeout(() => {
          router.push('/auth/setup-password');
        }, 3000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking password setup status
  if (checkingPasswordSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/30 backdrop-blur-xl border-purple-500/30">
          <CardContent className="p-6 text-center">
            <div className="text-white">Đang kiểm tra trạng thái mật khẩu...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/30 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center">
            Thay đổi mật khẩu
          </CardTitle>
          <CardDescription className="text-purple-200 text-center">
            Để bảo mật tài khoản, vui lòng nhập mật khẩu hiện tại và mật khẩu mới
            {email && (
              <div className="mt-2 text-sm text-purple-300">
                Email: {email}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-purple-200">Mật khẩu hiện tại *</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                required
                className="bg-black/30 border-purple-500/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-purple-200">Mật khẩu mới *</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                required
                className="bg-black/30 border-purple-500/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-purple-200">Xác nhận mật khẩu mới *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
                className="bg-black/30 border-purple-500/30 text-white"
              />
            </div>

            <div className="text-xs text-purple-200">
              <p>• Mật khẩu phải có ít nhất 6 ký tự</p>
              <p>• Mật khẩu mới phải khác mật khẩu hiện tại</p>
              <p>• Sử dụng mật khẩu mạnh để bảo vệ tài khoản</p>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400"
              >
                {loading ? 'Đang thay đổi...' : 'Thay đổi mật khẩu'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
