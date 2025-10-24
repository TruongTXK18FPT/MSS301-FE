'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import OTPInput from "@/components/ui/otp-input";
import { 
  Shield, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { authService } from '@/lib/services';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút = 300 giây
  const [canResend, setCanResend] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy email từ URL params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Nếu không có email, redirect về trang đăng ký
      router.push('/auth/register');
    }
  }, [searchParams, router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
      setWarning("Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.");
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setWarning("");

    if (!otp || otp.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 chữ số OTP");
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      setLoading(false);
      return;
    }

    try {
      await authService.verifyEmail(email, otp);
      setSuccess("Xác thực email thành công! Đang chuyển hướng...");
      
      // Redirect sau 2 giây
      setTimeout(() => {
        router.push('/auth/login?message=' + encodeURIComponent('Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.'));
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");
    setWarning("");

    try {
      await authService.resendOTP(email);
      setSuccess("Đã gửi lại mã OTP thành công!");
      setTimeLeft(300); // Reset timer về 5 phút
      setCanResend(false);
      setOtp(""); // Clear OTP input
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(""); // Clear error khi user nhập
  };

  const handleOtpComplete = (value: string) => {
    setOtp(value);
    // Tự động submit khi nhập đủ 6 số
    if (value.length === 6) {
      handleVerifyOTP();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Enhanced Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-indigo-900/30"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={`otp-particle-${i}`}
              className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-70 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${4 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <Card className="w-full max-w-md bg-black/30 backdrop-blur-xl border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-500/20 relative z-10 overflow-hidden animate-fade-in">
        {/* Card Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-purple-500/5 rounded-3xl animate-gradient"></div>
        
        <CardHeader className="text-center relative z-10 pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse">
              <Shield className="size-8 text-white animate-bounce" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 animate-gradient">
            Xác thực Email
          </CardTitle>
          <CardDescription className="text-purple-200/80 mt-2">
            Chúng tôi đã gửi mã xác thực đến email của bạn
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          {/* Email Display */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-purple-200">
              <Mail className="size-4" />
              <span className="text-sm font-medium">Email:</span>
              <span className="text-cyan-300">{email}</span>
            </div>
          </div>

          {/* Alerts */}
          {success && (
            <Alert className="bg-green-500/20 border-green-500/30 animate-success-bounce">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-200">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-500/20 border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {warning && (
            <Alert className="bg-yellow-500/20 border-yellow-500/30">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200">
                {warning}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-purple-200 font-medium flex items-center gap-2 justify-center">
                <Shield className="size-4" />
                Mã xác thực (OTP)
              </Label>
              <div className={`${shakeError ? 'animate-shake' : ''}`}>
                <OTPInput
                  length={6}
                  onComplete={handleOtpComplete}
                  onChange={handleOtpChange}
                  className="mt-4"
                />
              </div>
              <p className="text-xs text-purple-200/60 text-center">
                Nhập 6 chữ số từ email của bạn
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20">
              <Clock className="size-5 text-purple-300" />
              <span className="text-purple-200 font-medium">Mã hết hạn sau:</span>
              <span className={`text-2xl font-mono font-bold ${timeLeft <= 60 ? 'text-red-400 animate-countdown-pulse' : 'text-cyan-400'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <div className="pt-4 space-y-3">
              <Button 
                type="submit" 
                disabled={loading || !otp || otp.length !== 6}
                className="w-full rounded-xl h-14 text-base font-semibold bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white shadow-2xl shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle className="size-5 group-hover:animate-bounce" />
                  )}
                  {loading ? 'Đang xác thực...' : 'Xác thực Email'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>

              <Button 
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading || !canResend}
                variant="outline"
                className="w-full rounded-xl h-12 text-sm font-medium border-purple-400/30 text-purple-200 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  {resendLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-300"></div>
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  {resendLoading ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                </span>
              </Button>
            </div>
          </form>
          
          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-purple-200/80">
              <ArrowLeft className="size-4" />
              <Link href="/auth/register" className="text-sm hover:text-cyan-300 transition-colors hover:underline">
                Quay lại đăng ký
              </Link>
            </div>
            
            <div className="text-center">
              <p className="text-purple-200/80 text-sm">
                Đã có tài khoản?{' '}
                <Link href="/auth/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors hover:underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
