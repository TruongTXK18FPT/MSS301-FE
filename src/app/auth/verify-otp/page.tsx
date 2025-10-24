'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AuthAPI } from '@/services/auth.service';
import { Mail, Clock, RefreshCw } from 'lucide-react';

export default function VerifyOTPPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const email = params.get('email') || '';

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await AuthAPI.verifyEmail({ email, otpCode: otp });
      if (res.code === 1000) {
        toast({ 
          description: '✅ Xác minh thành công! Đang chuyển đến trang đăng nhập...',
          className: 'bg-green-500/20 border-green-500/50'
        });
        setTimeout(() => router.push('/auth/login'), 1500);
      } else {
        toast({ 
          description: res.message || '❌ Mã OTP không đúng hoặc đã hết hạn', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        description: '❌ Có lỗi xảy ra khi xác minh OTP', 
        variant: 'destructive' 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || isResending) return;
    
    setIsResending(true);
    try {
      const res = await AuthAPI.resendOTP(email);
      if (res.code === 1000) {
        toast({ 
          description: '✅ Mã OTP mới đã được gửi đến email của bạn!',
          className: 'bg-green-500/20 border-green-500/50'
        });
        setCountdown(60); // 60 seconds cooldown
        setOtp(''); // Clear current OTP input
      } else {
        toast({ 
          description: res.message || '❌ Không thể gửi lại mã OTP', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        description: '❌ Có lỗi xảy ra khi gửi lại mã OTP', 
        variant: 'destructive' 
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-teal-900/20">
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Xác thực Email
          </CardTitle>
          <CardDescription className="text-purple-200/70">
            Nhập mã OTP 6 số đã được gửi đến
          </CardDescription>
          <p className="text-cyan-400 font-medium">{email}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input 
                placeholder="Nhập mã OTP (6 số)" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono bg-black/30 border-cyan-500/30 focus:border-cyan-500 text-white"
                required
                autoFocus
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-6 rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:scale-[1.02]"
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang xác minh...
                </span>
              ) : (
                'Xác minh OTP'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-cyan-500/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/40 px-2 text-purple-200/50">
                Chưa nhận được mã?
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleResendOTP}
            disabled={countdown > 0 || isResending}
            className="w-full border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400 font-medium py-6 rounded-xl transition-all duration-300"
          >
            {isResending ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang gửi...
              </span>
            ) : countdown > 0 ? (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Gửi lại sau {countdown}s
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Gửi lại mã OTP
              </span>
            )}
          </Button>

          <p className="text-center text-sm text-purple-200/50 mt-4">
            Mã OTP có hiệu lực trong 5 phút
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
