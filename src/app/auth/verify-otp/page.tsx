'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AuthAPI } from '@/lib/services/auth.service';
import { Mail, Clock, RefreshCw, Shield, Sparkles } from 'lucide-react';
import OTPInput from '@/components/ui/otp-input';

export default function VerifyOTPPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // 60 seconds cooldown for resend
  const [otpExpiryTime, setOtpExpiryTime] = useState<Date | null>(null); // OTP expiry time from backend
  const [remainingSeconds, setRemainingSeconds] = useState(0); // Remaining seconds until OTP expiry
  const email = params.get('email') || '';

  // Initialize OTP expiry time from localStorage or fetch from backend
  useEffect(() => {
    if (!email) return;

    const storageKey = `otp_expiry_${email}`;
    const storedExpiry = localStorage.getItem(storageKey);
    
    if (storedExpiry) {
      const expiryDate = new Date(storedExpiry);
      // Check if OTP is still valid
      if (expiryDate > new Date()) {
        setOtpExpiryTime(expiryDate);
        return;
      } else {
        // OTP expired, clear storage
        localStorage.removeItem(storageKey);
      }
    }

    // If no valid expiry time in localStorage, fetch from backend
    const fetchOTPInfo = async () => {
      try {
        const res = await AuthAPI.getCurrentOTPInfo(email);
        if (res.code === 1000 && res.result) {
          const expiryTime = new Date(res.result.expiryTime);
          setOtpExpiryTime(expiryTime);
          // Save to localStorage
          localStorage.setItem(storageKey, expiryTime.toISOString());
        }
      } catch (error) {
        // If no OTP found or error, countdown will remain at 0
        console.error('Error fetching OTP info:', error);
      }
    };

    fetchOTPInfo();
  }, [email]);

  // Real-time countdown for OTP expiry based on backend expiry time
  useEffect(() => {
    if (!otpExpiryTime) return;

    const updateRemaining = () => {
      const now = new Date();
      const expiry = new Date(otpExpiryTime);
      const diff = Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 1000));
      
      setRemainingSeconds(diff);
      
      // Save to localStorage
      if (email) {
        const storageKey = `otp_expiry_${email}`;
        localStorage.setItem(storageKey, expiry.toISOString());
      }

      // Clear storage if expired
      if (diff === 0 && email) {
        const storageKey = `otp_expiry_${email}`;
        localStorage.removeItem(storageKey);
      }
    };

    // Update immediately
    updateRemaining();

    // Update every second
    const timer = setInterval(updateRemaining, 1000);
    return () => clearInterval(timer);
  }, [otpExpiryTime, email]);

  // Countdown timer for resend button (60 seconds = 1 minute)
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onSubmit = async (otpCode: string) => {
    // Validate OTP code before sending
    if (!otpCode || otpCode.trim().length !== 6) {
      toast({ 
        description: '❌ Vui lòng nhập đầy đủ 6 số OTP', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (!email || email.trim().length === 0) {
      toast({ 
        description: '❌ Email không hợp lệ', 
        variant: 'destructive' 
      });
      return;
    }
    
    setIsVerifying(true);
    try {
      console.log('Verifying OTP - email:', email, 'otpCode:', otpCode);
      const res = await AuthAPI.verifyEmail({ email, otp: otpCode });
      if (res.code === 1000) {
        // Show success message
        toast({ 
          description: '✅ Email đã được xác minh thành công!',
          className: 'bg-green-500/20 border-green-500/50'
        });
        
        // Only show teacher approval message if userType is TEACHER
        const userType = res.result?.userType;
        if (userType === 'TEACHER') {
          toast({ 
            description: 'Đơn đăng ký giáo viên của bạn đang được quản trị viên xem xét. Bạn sẽ nhận được email khi đơn được duyệt.',
            className: 'bg-blue-500/20 border-blue-500/50'
          });
        }
        
        // Clear OTP expiry from localStorage after successful verification
        const storageKey = `otp_expiry_${email}`;
        localStorage.removeItem(storageKey);
        
        setTimeout(() => router.push('/auth/login'), 3000);
      } else {
        toast({ 
          description: res.message || '❌ Mã OTP không đúng hoặc đã hết hạn', 
          variant: 'destructive' 
        });
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      console.error('Error response:', error?.response?.data);
      
      // Get error message from backend
      let errorMessage = '❌ Có lỗi xảy ra khi xác minh OTP';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.code) {
        // Map error codes to messages
        const errorCode = error.response.data.code;
        if (errorCode === 1012) { // INVALID_OTP
          errorMessage = 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại hoặc yêu cầu gửi lại mã mới.';
        }
      }
      
      toast({ 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isResending) return;
    
    setIsResending(true);
    try {
      const res = await AuthAPI.resendEmailVerificationOTP(email);
      if (res.code === 1000 && res.result) {
        // Set expiry time from backend response
        const expiryTime = new Date(res.result.expiryTime);
        setOtpExpiryTime(expiryTime);
        
        // Save to localStorage
        const storageKey = `otp_expiry_${email}`;
        localStorage.setItem(storageKey, expiryTime.toISOString());
        
        toast({ 
          description: '✅ Mã OTP mới đã được gửi đến email của bạn! Mã OTP có hiệu lực trong 5 phút.',
          className: 'bg-green-500/20 border-green-500/50'
        });
        setResendCooldown(60); // 60 seconds (1 minute) cooldown
        setOtp(''); // Clear current OTP input
      } else {
        toast({ 
          description: res.message || '❌ Không thể gửi lại mã OTP', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast({ 
        description: '❌ Có lỗi xảy ra khi gửi lại mã OTP', 
        variant: 'destructive' 
      });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (seconds: number) => {
    if (seconds > 60) return 'text-green-400';
    if (seconds > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getResendButtonContent = () => {
    if (isResending) {
      return (
        <div className="flex items-center gap-2">
          <div className="size-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
          Đang gửi...
        </div>
      );
    }
    
    if (resendCooldown > 0) {
      return (
        <div className="flex items-center gap-2">
          <Clock className="size-4" />
          Gửi lại sau {resendCooldown}s
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2">
        <RefreshCw className="size-4" />
        Gửi lại mã OTP
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/30"></div>
        <div className="absolute top-10 right-20 w-72 h-72 bg-gradient-to-r from-pink-500/10 to-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      <Card className="w-full max-w-lg bg-black/30 backdrop-blur-xl border border-pink-500/30 rounded-3xl shadow-2xl shadow-pink-500/20 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-violet-500/5 to-pink-500/5 rounded-3xl pointer-events-none"></div>
        
        <CardHeader className="text-center relative z-10 pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-400/30">
              <Shield className="size-8 text-pink-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-400 to-pink-400">
            Xác thực Email
          </CardTitle>
          <CardDescription className="text-pink-200/80 mt-2">
            Nhập mã OTP 6 số đã được gửi đến email của bạn
          </CardDescription>
          <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
            <p className="text-yellow-300 text-xs text-center font-medium">
              ⏱️ Mã OTP chỉ có hiệu lực trong 5 phút. Vui lòng nhập mã ngay sau khi nhận được.
            </p>
          </div>
          <div className="mt-3 p-2 bg-black/20 rounded-lg border border-purple-400/20">
            <p className="text-cyan-400 font-medium flex items-center justify-center gap-2">
              <Mail className="size-4" />
              {email}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          {/* OTP Timer */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full border border-purple-400/20">
              <Clock className="size-4 text-purple-400" />
              <span className="text-purple-200 font-medium">
                Mã OTP có hiệu lực trong: 
              </span>
              <span className={`font-mono font-bold ${getTimerColor(remainingSeconds)}`}>
                {formatTime(remainingSeconds)}
              </span>
            </div>
          </div>

          {/* OTP Input */}
          <div className="space-y-4">
            <OTPInput 
              length={6}
              onComplete={onSubmit}
              onChange={setOtp}
              className="my-6"
            />
            
            {remainingSeconds === 0 && otpExpiryTime && (
              <div className="text-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm font-medium">
                  ⚠️ Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.
                </p>
              </div>
            )}
          </div>

          {/* Verify Button */}
          <Button 
            onClick={() => onSubmit(otp)}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
            disabled={isVerifying || otp.length !== 6 || remainingSeconds === 0}
          >
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang xác minh...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="size-4" />
                Xác minh OTP
              </div>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/40 px-2 text-pink-200/50">
                Chưa nhận được mã?
              </span>
            </div>
          </div>

          {/* Resend Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleResendOTP}
            disabled={resendCooldown > 0 || isResending}
            className="w-full border-purple-400/30 hover:border-purple-400/50 hover:bg-purple-500/10 text-purple-400 font-medium py-3 rounded-xl transition-all duration-300"
          >
            {getResendButtonContent()}
          </Button>

          {/* Info */}
          <div className="text-center space-y-2">
            <p className="text-sm text-pink-200/60">
              Mã OTP sẽ được gửi đến email của bạn
            </p>
            <p className="text-xs text-yellow-300/70 font-medium">
              ⚠️ Lưu ý: Mã OTP chỉ có hiệu lực trong 5 phút. Sau khi hết hạn, bạn cần yêu cầu gửi lại mã mới.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
