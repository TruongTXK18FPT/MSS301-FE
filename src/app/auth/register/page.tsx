'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Mail, Lock, User, Rocket, UserCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AuthAPI } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const registerSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  username: z.string().min(3, "Tên đăng nhập tối thiểu 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu"),
  userType: z.enum(["STUDENT", "TEACHER", "GUARDIAN"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      fullName: "", 
      username: "", 
      email: "", 
      password: "", 
      confirmPassword: "",
      userType: "STUDENT" 
    },
  });

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/30"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
        
        {/* Removed random particles to avoid SSR/CSR hydration mismatch */}
        
        <div className="absolute top-10 right-20 w-72 h-72 bg-gradient-to-r from-pink-500/10 to-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      <Card className="w-full max-w-3xl bg-black/30 backdrop-blur-xl border border-pink-500/30 rounded-3xl shadow-2xl shadow-pink-500/20 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-violet-500/5 to-pink-500/5 rounded-3xl pointer-events-none"></div>
        
        <CardHeader className="text-center relative z-10 pb-4">
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-400 to-pink-400">
            Chọn vai trò đăng ký
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <Link href="/auth/register/student" className="block">
              <div className="h-full rounded-2xl border border-pink-500/30 p-8 transition shadow-lg hover:bg-pink-500/10 text-center flex flex-col items-center justify-center min-h-[140px] relative z-10" aria-label="Đăng ký học sinh">
                <div className="text-4xl mb-2">🎓</div>
                <div className="text-white font-semibold text-lg">Học sinh</div>
              </div>
            </Link>
            <Link href="/auth/register/teacher" className="block">
              <div className="h-full rounded-2xl border border-pink-500/30 p-8 transition shadow-lg hover:bg-pink-500/10 text-center flex flex-col items-center justify-center min-h-[140px] relative z-10" aria-label="Đăng ký giáo viên">
                <div className="text-4xl mb-2">👨‍🏫</div>
                <div className="text-white font-semibold text-lg">Giáo viên</div>
              </div>
            </Link>
            <Link href="/auth/register/guardian" className="block">
              <div className="h-full rounded-2xl border border-pink-500/30 p-8 transition shadow-lg hover:bg-pink-500/10 text-center flex flex-col items-center justify-center min-h-[140px] relative z-10" aria-label="Đăng ký phụ huynh">
                <div className="text-4xl mb-2">👪</div>
                <div className="text-white font-semibold text-lg">Phụ huynh</div>
              </div>
            </Link>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-pink-200/80">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="font-medium text-violet-400 hover:text-violet-300 transition-colors hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}