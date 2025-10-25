'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthAPI } from '@/lib/services/auth.service';
import { useAuth } from '@/context/auth-context';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { email } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'new-password'>('email');
  const [emailInput, setEmailInput] = useState(email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!emailInput) {
      setError('Vui lòng nhập email');
      return;
    }

    setLoading(true);

    try {
      await AuthAPI.sendPasswordResetOTP(emailInput);
      setStep('otp');
      setSuccess('Mã OTP đã được gửi đến email của bạn');
    } catch (error: any) {
      setError(error.message || 'Có lỗi xảy ra khi gửi OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp) {
      setError('Vui lòng nhập mã OTP');
      return;
    }

    // Skip OTP verification step - go directly to new password step
    setStep('new-password');
    setSuccess('Bạn có thể đặt mật khẩu mới');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      await AuthAPI.resetPassword({
        email: emailInput,
        otp,
        newPassword
      });
      
      setSuccess('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendOTP} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-200 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-md text-green-200 text-sm">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-purple-200">Email *</Label>
        <Input
          id="email"
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="Nhập email của bạn"
          required
          className="bg-black/30 border-purple-500/30 text-white"
        />
      </div>

      <div className="text-xs text-purple-200">
        <p>• Mã OTP sẽ được gửi đến email này</p>
        <p>• Kiểm tra cả hộp thư spam</p>
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
          {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
        </Button>
      </div>
    </form>
  );

  const renderOTPStep = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-200 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-md text-green-200 text-sm">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="otp" className="text-purple-200">Mã OTP *</Label>
        <Input
          id="otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Nhập mã OTP từ email"
          required
          className="bg-black/30 border-purple-500/30 text-white"
        />
      </div>

      <div className="text-xs text-purple-200">
        <p>• Mã OTP có hiệu lực trong 5 phút</p>
        <p>• Không chia sẻ mã OTP với ai khác</p>
      </div>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('email')}
          className="flex-1 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
        >
          Quay lại
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400"
        >
          {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
        </Button>
      </div>
    </form>
  );

  const renderNewPasswordStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-200 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-md text-green-200 text-sm">
          {success}
        </div>
      )}

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
        <p>• Sử dụng mật khẩu mạnh để bảo vệ tài khoản</p>
      </div>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('otp')}
          className="flex-1 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
        >
          Quay lại
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400"
        >
          {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
        </Button>
      </div>
    </form>
  );

  const getTitle = () => {
    switch (step) {
      case 'email': return 'Quên mật khẩu';
      case 'otp': return 'Xác thực OTP';
      case 'new-password': return 'Đặt lại mật khẩu';
      default: return 'Quên mật khẩu';
    }
  };

  const getDescription = () => {
    switch (step) {
      case 'email': return 'Nhập email để nhận mã OTP đặt lại mật khẩu';
      case 'otp': return 'Nhập mã OTP đã được gửi đến email của bạn';
      case 'new-password': return 'Nhập mật khẩu mới cho tài khoản của bạn';
      default: return 'Nhập email để nhận mã OTP đặt lại mật khẩu';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/30 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center">
            {getTitle()}
          </CardTitle>
          <CardDescription className="text-purple-200 text-center">
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' && renderEmailStep()}
          {step === 'otp' && renderOTPStep()}
          {step === 'new-password' && renderNewPasswordStep()}
        </CardContent>
      </Card>
    </div>
  );
}
