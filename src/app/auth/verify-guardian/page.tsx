'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Mail, Shield, Clock } from "lucide-react";
import { profileService } from '@/lib/services';

export default function StudentVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationCode, setVerificationCode] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [guardianInfo, setGuardianInfo] = useState<any>(null);

  useEffect(() => {
    // Get student email from URL params or localStorage
    const email = searchParams.get('email') || localStorage.getItem('studentEmail');
    if (email) {
      setStudentEmail(email);
    }
  }, [searchParams]);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('Vui lòng nhập mã xác nhận');
      return;
    }

    if (!studentEmail.trim()) {
      setError('Vui lòng nhập email học sinh');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call verification API
      await profileService.verifyStudentRelationship(studentEmail, verificationCode);
      
      setSuccess(true);
      
      // Redirect to student dashboard after 3 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 3000);

    } catch (error: any) {
      console.error('Verification failed:', error);
      setError(error.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900/20 via-blue-900/10 to-indigo-900/20 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/30 backdrop-blur-xl border-green-500/30">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Xác nhận thành công!</h2>
            <p className="text-green-200 mb-4">
              Bạn đã được thêm vào danh sách quản lý của phụ huynh.
            </p>
            <p className="text-purple-200 text-sm">
              Đang chuyển hướng đến trang profile...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-xl border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-white text-xl font-bold">
              MathMind
            </Link>
            <Link 
              href="/auth/login" 
              className="text-purple-200 hover:text-white transition-colors"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="w-full max-w-md bg-black/30 backdrop-blur-xl border-purple-500/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <CardTitle className="text-white text-xl">Xác nhận quan hệ phụ huynh</CardTitle>
            <CardDescription className="text-purple-200">
              Nhập mã xác nhận được gửi đến email của bạn để xác nhận quan hệ với phụ huynh
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-500/30 bg-red-500/10">
                <XCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-200">Email học sinh</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                  <Input
                    id="email"
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="Nhập email học sinh"
                    className="pl-10 bg-black/20 border-purple-500/30 text-white placeholder:text-purple-300"
                    disabled={!!searchParams.get('email')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-purple-200">Mã xác nhận</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                  <Input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã xác nhận (8 ký tự)"
                    className="pl-10 bg-black/20 border-purple-500/30 text-white placeholder:text-purple-300"
                    maxLength={8}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleVerify}
                disabled={loading || !verificationCode.trim() || !studentEmail.trim()}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50"
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Đang xác nhận...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Xác nhận quan hệ
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-purple-300 text-sm">
                  Chưa nhận được mã?{' '}
                  <Link href="/auth/login" className="text-purple-200 hover:text-white underline">
                    Đăng nhập để kiểm tra
                  </Link>
                </p>
              </div>
            </div>

            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
              <h4 className="text-white font-medium mb-2">Lưu ý:</h4>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>• Mã xác nhận có hiệu lực trong 24 giờ</li>
                <li>• Mỗi mã chỉ sử dụng được một lần</li>
                <li>• Liên hệ phụ huynh nếu không nhận được mã</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
