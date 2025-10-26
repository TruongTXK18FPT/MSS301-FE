'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Shield, Mail, ArrowLeft } from "lucide-react";
import { profileService } from '@/lib/services';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/services/auth.service';

export default function VerifyGuardianPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Get user email from context or storage
    const currentUser = user || authService.getCurrentUserFromStorage();
    if (currentUser?.email) {
      setUserEmail(currentUser.email);
      console.log('User email loaded:', currentUser.email);
    } else {
      console.error('User email not found in context');
    }
  }, [user]);

  const handleVerify = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Mã xác nhận phải có 6 số');
      return;
    }

    if (!userEmail) {
      setError('Email không tồn tại. Vui lòng đăng nhập lại.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await profileService.verifyStudentRelationship(
        userEmail,
        verificationCode
      );
      
      setSuccess(true);
      toast({
        title: "Xác nhận thành công",
        description: "Đã xác nhận quan hệ phụ huynh thành công!",
        variant: "default",
      });

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Không thể xác nhận quan hệ');
      toast({
        title: "Xác nhận thất bại",
        description: error.response?.data?.message || error.message || 'Không thể xác nhận quan hệ',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!userEmail) {
      setError('Email không tồn tại. Vui lòng đăng nhập lại.');
      return;
    }

    setResendLoading(true);
    setError(null);

    try {
      await profileService.resendGuardianVerification(userEmail);
      
      setCountdown(60); // 60 seconds countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: "Mã xác nhận mới đã được gửi",
        description: "Vui lòng kiểm tra email của bạn",
        variant: "default",
      });
    } catch (error: any) {
      setError('Không thể gửi lại mã xác nhận');
      toast({
        title: "Gửi lại thất bại",
        description: error.response?.data?.message || error.message || 'Không thể gửi lại mã xác nhận',
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-green-500/10 backdrop-blur-xl border-green-500/50 text-white">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-center text-green-400">Xác nhận thành công!</CardTitle>
            <CardDescription className="text-center text-green-200">
              Bạn đã xác nhận quan hệ phụ huynh thành công. Đang chuyển về trang profile...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/90 backdrop-blur-xl border-green-500/30 text-white">
        <CardHeader>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/profile')}
            className="mb-4 text-green-200 hover:text-green-400"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <CardTitle className="text-green-400 flex items-center space-x-2">
            <Shield className="w-6 h-6" />
            <span>Xác Nhận Quan Hệ Phụ Huynh</span>
          </CardTitle>
          <CardDescription className="text-green-200">
            Nhập mã xác nhận 6 số được gửi đến email của bạn để xác nhận quan hệ với phụ huynh.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-green-200">Mã xác nhận (6 số)</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 w-4 h-4 text-green-400" />
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Nhập mã xác nhận"
                  className="pl-10 bg-black/20 border-green-500/30 text-white placeholder:text-green-300"
                  maxLength={6}
                  disabled={loading || success}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleVerify}
              disabled={loading || !verificationCode.trim() || success}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang xác nhận...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Xác nhận quan hệ
                </>
              )}
            </Button>
            <Button
              onClick={handleResend}
              disabled={resendLoading || countdown > 0 || success}
              variant="outline"
              className="w-full border-green-500/30 text-green-200 hover:bg-green-500/20 disabled:opacity-50"
            >
              {resendLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2" />
                  Đang gửi lại...
                </>
              ) : countdown > 0 ? (
                `Gửi lại sau ${countdown}s`
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Gửi lại mã xác nhận
                </>
              )}
            </Button>
          </div>

          <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
            <h4 className="text-white font-medium mb-2 text-sm">Lưu ý:</h4>
            <ul className="text-green-200 text-xs space-y-1">
              <li>• Mã xác nhận có hiệu lực trong 5 phút</li>
              <li>• Mỗi mã chỉ sử dụng được một lần</li>
              <li>• Liên hệ phụ huynh nếu không nhận được mã</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

