'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleAuthService, PasswordSetupRequest } from '@/services/google-auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  newPassword: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: z.string().min(6, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});

type PasswordSetupForm = z.infer<typeof schema>;

export default function PasswordSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PasswordSetupForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: searchParams.get('email') || '',
    }
  });

  const onSubmit = async (values: PasswordSetupForm) => {
    try {
      setLoading(true);
      
      const request: PasswordSetupRequest = {
        email: values.email,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      };

      await GoogleAuthService.setupPassword(request);
      
      toast({ description: 'Thiết lập mật khẩu thành công!' });
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Password setup error:', error);
      toast({ description: 'Thiết lập mật khẩu thất bại', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Thiết lập mật khẩu</CardTitle>
          <CardDescription className="text-center">
            Thiết lập mật khẩu để bảo mật tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email" 
                placeholder="email@example.com" 
                {...register('email')}
                disabled
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Mật khẩu mới</Label>
              <Input 
                type="password" 
                placeholder="Nhập mật khẩu mới" 
                {...register('newPassword')}
              />
              {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Xác nhận mật khẩu</Label>
              <Input 
                type="password" 
                placeholder="Xác nhận mật khẩu" 
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang thiết lập...' : 'Thiết lập mật khẩu'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
