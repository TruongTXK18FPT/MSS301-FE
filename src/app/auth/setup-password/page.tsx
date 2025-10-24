'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from '@/lib/services/authService';
import { useAuth } from '@/context/auth-context';

export default function SetupPasswordPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      await authService.setupPassword(password);
      router.push('/profile');
    } catch (error: any) {
      setError(error.message || 'Có lỗi xảy ra khi thiết lập mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/30 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center">
            Thiết lập mật khẩu
          </CardTitle>
          <CardDescription className="text-purple-200 text-center">
            Để bảo mật tài khoản, vui lòng thiết lập mật khẩu cho tài khoản của bạn
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
              <Label htmlFor="password" className="text-purple-200">Mật khẩu mới *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                required
                className="bg-black/30 border-purple-500/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-purple-200">Xác nhận mật khẩu *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
                className="bg-black/30 border-purple-500/30 text-white"
              />
            </div>

            <div className="text-xs text-purple-200">
              <p>• Mật khẩu phải có ít nhất 6 ký tự</p>
              <p>• Sử dụng mật khẩu mạnh để bảo vệ tài khoản</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400"
            >
              {loading ? 'Đang thiết lập...' : 'Thiết lập mật khẩu'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
