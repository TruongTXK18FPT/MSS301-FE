'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, Sparkles, Rocket } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { authService } from '@/lib/services';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success message from register
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccess(message);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.login({ email, password });
      router.push('/profile');
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-indigo-900/30"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={`login-particle-${i}`}
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
              <Sparkles className="size-8 text-white animate-bounce" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 animate-gradient">
            Chào mừng trở lại
          </CardTitle>
          <CardDescription className="text-purple-200/80 mt-2">
            Đăng nhập để tiếp tục hành trình khám phá vũ trụ toán học.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          {success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-200 text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-purple-200 font-medium flex items-center gap-2">
                <Mail className="size-4" />
                Địa chỉ Email
              </Label>
              <div className="relative group">
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="ten@email.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/40 border-purple-400/30 text-white placeholder:text-purple-200/50 rounded-xl h-14 pl-12 backdrop-blur-sm focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300" 
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-purple-300 group-focus-within:text-cyan-300 transition-colors" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-purple-200 font-medium flex items-center gap-2">
                  <Lock className="size-4" />
                  Mật khẩu
                </Label>
                <Link href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative group">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/40 border-purple-400/30 text-white rounded-xl h-14 pl-12 pr-12 backdrop-blur-sm focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300" 
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-purple-300 group-focus-within:text-cyan-300 transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-cyan-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-xl h-14 text-base font-semibold bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white shadow-2xl shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Rocket className="size-5 group-hover:animate-bounce" />
                  )}
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-purple-200/80">
              Chưa có tài khoản?{' '}
              <Link href="/auth/register" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
