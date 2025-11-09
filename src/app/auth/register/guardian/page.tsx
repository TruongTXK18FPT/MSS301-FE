'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthAPI } from "@/lib/services/auth.service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterRequest } from "@/lib/dto/auth";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Users, Phone, Heart } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  relationship: z.string().min(1, "Vui lòng nhập quan hệ"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type GuardianForm = z.infer<typeof schema>;

export default function GuardianRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<GuardianForm>({ resolver: zodResolver(schema) });

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
              <Heart className="size-8 text-pink-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-400 to-pink-400">
            Đăng ký phụ huynh
          </CardTitle>
          <CardDescription className="text-pink-200/80 mt-2">
            Đồng hành cùng con trong hành trình học tập
          </CardDescription>
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3 mt-4">
            <p className="text-blue-200 text-sm text-center">
              💡 Sau khi đăng ký, bạn có thể thêm học sinh vào danh sách quản lý trong trang profile
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          <form className="space-y-5" onSubmit={handleSubmit(async (values) => {
            setSubmitting(true);
            try {
              const payload: RegisterRequest = {
                fullName: values.name,
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword,
                userType: 'GUARDIAN',
              };
              const res = await AuthAPI.register(payload);
              if (res.code === 1000) {
                toast({ description: 'Đăng ký thành công. Vui lòng kiểm tra email để nhập OTP.' });
                router.push('/auth/verify-otp?email=' + encodeURIComponent(values.email));
              } else {
                toast({ description: res.message || 'Đăng ký thất bại', variant: 'destructive' });
              }
            } catch (error: any) {
              console.error('Register error:', error);
              let errorMessage = 'Đăng ký thất bại';
              let errorCode = null;
              
              // Get error from backend response
              if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
                errorCode = error.response.data.code;
              } else if (error?.response?.data?.code) {
                errorCode = error.response.data.code;
              }
              
              // Check if email already exists (ErrorCode.USER_EXISTED = 1002)
              if (errorCode === 1002 || errorMessage.includes("Email này đã được sử dụng")) {
                // Set error on email field to highlight it
                setError('email', {
                  type: 'manual',
                  message: errorMessage
                });
              }
              
              toast({ description: errorMessage, variant: 'destructive' });
            } finally {
              setSubmitting(false);
            }
          })}>
            
            {/* Họ và Tên */}
            <div className="space-y-2">
              <Label className="text-pink-200 font-medium flex items-center gap-2">
                <User className="size-4" />
                Họ và Tên
              </Label>
              <div className="relative">
                <Input 
                  placeholder="Tên của bạn" 
                  {...register('name')}
                  className="bg-black/40 border-purple-400/30 text-white rounded-xl backdrop-blur-sm focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-purple-400/50 pl-4"
                />
                <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 size-4 text-purple-400 opacity-50" />
              </div>
              {errors.name && <p className="text-sm text-red-400 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.name.message}
              </p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-pink-200 font-medium flex items-center gap-2">
                <Mail className="size-4" />
                Email
              </Label>
              <div className="relative">
                <Input 
                  type="email" 
                  placeholder="email@domain.com" 
                  {...register('email')}
                  className={`bg-black/40 text-white rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 pl-4 ${
                    errors.email 
                      ? 'border-red-500/50 focus:border-red-500/50' 
                      : 'border-purple-400/30 focus:border-cyan-400/50 hover:border-purple-400/50'
                  }`}
                />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 size-4 text-purple-400 opacity-50" />
              </div>
              {errors.email && <p className="text-sm text-red-400 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.email.message}
              </p>}
            </div>

            {/* Mật khẩu */}
            <div className="space-y-2">
              <Label className="text-pink-200 font-medium flex items-center gap-2">
                <Lock className="size-4" />
                Mật khẩu
              </Label>
              <div className="relative">
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  {...register('password')}
                  className="bg-black/40 border-purple-400/30 text-white rounded-xl backdrop-blur-sm focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-purple-400/50 pl-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-400 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.password.message}
              </p>}
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="space-y-2">
              <Label className="text-pink-200 font-medium flex items-center gap-2">
                <Lock className="size-4" />
                Xác nhận mật khẩu
              </Label>
              <div className="relative">
                <Input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  {...register('confirmPassword')}
                  className="bg-black/40 border-purple-400/30 text-white rounded-xl backdrop-blur-sm focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-purple-400/50 pl-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-400 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.confirmPassword.message}
              </p>}
            </div>

            {/* Quan hệ */}
            <div className="space-y-2">
              <Label className="text-pink-200 font-medium flex items-center gap-2">
                <Heart className="size-4" />
                Mối quan hệ
              </Label>
              <div className="relative">
                <Input 
                  placeholder="Cha/Mẹ/Người giám hộ" 
                  {...register('relationship')}
                  className="bg-black/40 border-purple-400/30 text-white rounded-xl backdrop-blur-sm focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-purple-400/50 pl-4"
                />
                <Heart className="absolute right-3 top-1/2 transform -translate-y-1/2 size-4 text-purple-400 opacity-50" />
              </div>
              {errors.relationship && <p className="text-sm text-red-400 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.relationship.message}
              </p>}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <Label className="text-pink-200 font-medium flex items-center gap-2">
                <Phone className="size-4" />
                Số điện thoại
              </Label>
              <div className="relative">
                <Input 
                  placeholder="Số điện thoại" 
                  {...register('phone')}
                  className="bg-black/40 border-purple-400/30 text-white rounded-xl backdrop-blur-sm focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-purple-400/50 pl-4"
                />
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 size-4 text-purple-400 opacity-50" />
              </div>
              {errors.phone && <p className="text-sm text-red-400 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.phone.message}
              </p>}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang xử lý...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4" />
                  Tạo tài khoản phụ huynh
                </div>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-pink-200/80">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="font-medium text-violet-400 hover:text-violet-300 transition-colors hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


