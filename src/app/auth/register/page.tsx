'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Sparkles, Rocket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { authService } from '@/lib/services';
import { useRouter } from 'next/navigation';

const userTypes = [
  {value: "STUDENT", label: "Học sinh" },
  {value: "TEACHER", label: "Giáo viên" },
  {value: "GUARDIAN", label: "Phụ huynh" },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Kiểm tra mật khẩu khớp khi user nhập confirm password
    if (field === 'confirmPassword' && formData.password && value !== formData.password) {
      setPasswordError("Mật khẩu xác nhận không khớp!");
    } else if (field === 'confirmPassword' && formData.password && value === formData.password) {
      setPasswordError("");
    }
    
    // Kiểm tra lại khi user thay đổi password chính
    if (field === 'password' && formData.confirmPassword && value !== formData.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp!");
    } else if (field === 'password' && formData.confirmPassword && value === formData.confirmPassword) {
      setPasswordError("");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Kiểm tra mật khẩu khớp
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      setLoading(false);
      return;
    }

    // Kiểm tra các field required
    if (!formData.fullName || !formData.username || !formData.email || !formData.userType) {
      setError("Vui lòng điền đầy đủ thông tin!");
      setLoading(false);
      return;
    }

    try {
      await authService.register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userType: formData.userType
      });
      
      // Sau khi đăng ký thành công, chuyển đến trang xác thực OTP
      router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Enhanced Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/30"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={`register-particle-${i}`}
              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full opacity-70 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-10 right-20 w-72 h-72 bg-gradient-to-r from-pink-500/10 to-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      <Card className="w-full max-w-lg bg-black/30 backdrop-blur-xl border border-pink-500/30 rounded-3xl shadow-2xl shadow-pink-500/20 relative z-10 overflow-hidden animate-fade-in">
        {/* Card Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-violet-500/5 to-pink-500/5 rounded-3xl animate-gradient"></div>
        
        <CardHeader className="text-center relative z-10 pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 animate-pulse">
              <Rocket className="size-8 text-white animate-bounce" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-400 to-pink-400 animate-gradient">
            Tạo Tài Khoản
          </CardTitle>
          <CardDescription className="text-pink-200/80 mt-2">
            Bắt đầu cuộc hành trình toán học của bạn với MathMind.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="fullName" className="text-pink-200 font-medium flex items-center gap-2">
                <User className="size-4" />
                Họ và Tên
              </Label>
              <div className="relative group">
                <Input 
                  id="fullName" 
                  type="text" 
                  placeholder="Họ và tên đầy đủ" 
                  required 
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="bg-black/40 border-pink-400/30 text-white placeholder:text-pink-200/50 rounded-xl h-14 pl-12 backdrop-blur-sm focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300" 
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-pink-300 group-focus-within:text-violet-300 transition-colors" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="username" className="text-pink-200 font-medium flex items-center gap-2">
                <User className="size-4" />
                Tên đăng nhập
              </Label>
              <div className="relative group">
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="Tên đăng nhập" 
                  required 
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="bg-black/40 border-pink-400/30 text-white placeholder:text-pink-200/50 rounded-xl h-14 pl-12 backdrop-blur-sm focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300" 
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-pink-300 group-focus-within:text-violet-300 transition-colors" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-pink-200 font-medium flex items-center gap-2">
                <Mail className="size-4" />
                Địa chỉ Email
              </Label>
              <div className="relative group">
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="ten@email.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-black/40 border-pink-400/30 text-white placeholder:text-pink-200/50 rounded-xl h-14 pl-12 backdrop-blur-sm focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300" 
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-pink-300 group-focus-within:text-violet-300 transition-colors" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="userType" className="text-pink-200 font-medium flex items-center gap-2">
                <GraduationCap className="size-4" />
                Loại tài khoản
              </Label>
              <div className="relative group">
                <Select value={formData.userType} onValueChange={(value) => handleInputChange('userType', value)}>
                  <SelectTrigger className="bg-black/40 border-pink-400/30 text-white rounded-xl h-14 pl-12 backdrop-blur-sm focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300">
                    <SelectValue placeholder="Chọn loại tài khoản" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 backdrop-blur-xl border-pink-400/30 rounded-xl">
                    {userTypes.map((type) => (
                      <SelectItem 
                        key={type.value} 
                        value={type.value}
                        className="text-white hover:bg-pink-500/20 focus:bg-violet-500/20 rounded-lg"
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-pink-300 group-focus-within:text-violet-300 transition-colors" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-pink-200 font-medium flex items-center gap-2">
                <Lock className="size-4" />
                Mật khẩu
              </Label>
              <div className="relative group">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="bg-black/40 border-pink-400/30 text-white rounded-xl h-14 pl-12 pr-12 backdrop-blur-sm focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300" 
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-pink-300 group-focus-within:text-violet-300 transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-pink-300 hover:text-violet-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-pink-200 font-medium flex items-center gap-2">
                <Lock className="size-4" />
                Xác nhận mật khẩu
              </Label>
              <div className="relative group">
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  required 
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="bg-black/40 border-pink-400/30 text-white rounded-xl h-14 pl-12 pr-12 backdrop-blur-sm focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300" 
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-pink-300 group-focus-within:text-violet-300 transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-pink-300 hover:text-violet-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              {passwordError && (
                <p className="text-red-400 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={loading || !!passwordError || !formData.fullName || !formData.username || !formData.email || !formData.userType}
                className="w-full rounded-xl h-14 text-base font-semibold bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white shadow-2xl shadow-pink-500/30 transition-all duration-300 hover:scale-105 hover:shadow-pink-500/40 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Sparkles className="size-5 group-hover:animate-spin" />
                  )}
                  {loading ? 'Đang tạo tài khoản...' : '🚀 Tạo tài khoản'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>
          </form>
          
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
