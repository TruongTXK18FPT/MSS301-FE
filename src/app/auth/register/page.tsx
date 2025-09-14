'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Sparkles, Rocket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const gradeLevels = [
  {value: "1", label: "Lớp 1" },
  {value: "2", label: "Lớp 2" },
  {value: "3", label: "Lớp 3" },
  {value: "4", label: "Lớp 4" },
  {value: "5", label: "Lớp 5" },
  { value: "6", label: "Lớp 6" },
  { value: "7", label: "Lớp 7" },
  { value: "8", label: "Lớp 8" },
  { value: "9", label: "Lớp 9" },
  { value: "10", label: "Lớp 10" },
  { value: "11", label: "Lớp 11" },
  { value: "12", label: "Lớp 12" },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    grade: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          {[...Array(20)].map((_, i) => (
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
          <form className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-pink-200 font-medium flex items-center gap-2">
                <User className="size-4" />
                Họ và Tên
              </Label>
              <div className="relative group">
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Tên của bạn" 
                  required 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
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
              <Label htmlFor="grade" className="text-pink-200 font-medium flex items-center gap-2">
                <GraduationCap className="size-4" />
                Lớp học hiện tại
              </Label>
              <div className="relative group">
                <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                  <SelectTrigger className="bg-black/40 border-pink-400/30 text-white rounded-xl h-14 pl-12 backdrop-blur-sm focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300">
                    <SelectValue placeholder="Chọn lớp học của bạn" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 backdrop-blur-xl border-pink-400/30 rounded-xl">
                    {gradeLevels.map((grade) => (
                      <SelectItem 
                        key={grade.value} 
                        value={grade.value}
                        className="text-white hover:bg-pink-500/20 focus:bg-violet-500/20 rounded-lg"
                      >
                        {grade.label}
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
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full rounded-xl h-14 text-base font-semibold bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white shadow-2xl shadow-pink-500/30 transition-all duration-300 hover:scale-105 hover:shadow-pink-500/40 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="size-5 group-hover:animate-spin" />
                  🚀 Tạo tài khoản
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
