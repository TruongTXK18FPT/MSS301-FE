'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleAuthService } from '@/lib/services/google-auth.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function GoogleLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'password_required'>('loading');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (code && state) {
        try {
          setLoading(true);
          const response = await GoogleAuthService.handleCallback(code, state);
          
          if (response.authenticated) {
            if (response.token) {
              // User is fully authenticated
              localStorage.setItem('token', response.token);
              setStatus('success');
              toast({ description: 'Đăng nhập Google thành công!' });
              router.push('/');
            } else {
              // User needs to setup password
              const isPasswordRequired = await GoogleAuthService.isPasswordSetupRequired(response.email!);
              
              if (isPasswordRequired) {
                setStatus('password_required');
              } else {
                setStatus('success');
                router.push('/');
              }
            }
          } else {
            setStatus('error');
            toast({ description: 'Đăng nhập Google thất bại', variant: 'destructive' });
          }
        } catch (error) {
          console.error('Google OAuth callback error:', error);
          setStatus('error');
          toast({ description: 'Lỗi xử lý đăng nhập Google', variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      } else {
        setStatus('error');
        toast({ description: 'Thiếu thông tin xác thực', variant: 'destructive' });
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, toast]);

  const handleRedirectToGoogle = () => {
    try {
      setLoading(true);
      // Direct redirect to backend endpoint
      window.location.href = 'http://localhost:8080/api/v1/authenticate/auth/google/redirect';
    } catch (error) {
      console.error('Failed to redirect to Google:', error);
      toast({ description: 'Lỗi chuyển hướng đến Google', variant: 'destructive' });
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Đang xử lý đăng nhập Google...</CardTitle>
            <CardDescription className="text-center">
              Vui lòng đợi trong giây lát
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Đăng nhập thất bại</CardTitle>
            <CardDescription className="text-center">
              Có lỗi xảy ra trong quá trình đăng nhập Google
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleRedirectToGoogle} 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Đang chuyển hướng...' : 'Thử lại với Google'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'password_required') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Cần thiết lập mật khẩu</CardTitle>
            <CardDescription className="text-center">
              Bạn cần thiết lập mật khẩu để hoàn tất đăng nhập
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/auth/setup-password')} 
              className="w-full"
            >
              Thiết lập mật khẩu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-green-600">Đăng nhập thành công!</CardTitle>
          <CardDescription className="text-center">
            Bạn đã đăng nhập thành công với Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => router.push('/')} 
            className="w-full"
          >
            Đi đến Trang chủ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
