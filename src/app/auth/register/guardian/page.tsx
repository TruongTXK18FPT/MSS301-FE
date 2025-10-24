'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthAPI } from "@/services/auth.service";
// Address selection removed for shorter initial form
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  guardianStudentEmail: z.string().email("Email học sinh không hợp lệ"),
  relationship: z.string().min(1, "Vui lòng nhập quan hệ"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type GuardianForm = z.infer<typeof schema>;

export default function GuardianRegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<GuardianForm>({ resolver: zodResolver(schema) });
  // Removed province/ward fetching for shorter form

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-black/30 backdrop-blur-xl border border-pink-500/30 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-center">Đăng ký phụ huynh</CardTitle>
          <CardDescription className="text-center">Vui lòng điền thông tin cơ bản</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(async (values) => {
            const payload = {
              username: values.name || values.email.split('@')[0],
              fullName: values.name,
              email: values.email,
              password: values.password,
              confirmPassword: values.confirmPassword,
              userType: 'GUARDIAN' as const,
              // Guardian must provide student email; send later in profile completion
            } as const;
            const res = await AuthAPI.register(payload);
            if (res.code === 1000) {
              toast({ description: 'Đăng ký thành công. Vui lòng kiểm tra email để nhập OTP.' });
              router.push('/auth/verify-otp?email=' + encodeURIComponent(values.email));
            } else {
              toast({ description: res.message || 'Đăng ký thất bại', variant: 'destructive' });
            }
          })}>
            <div className="space-y-3">
              <Label>Họ và Tên</Label>
              <Input placeholder="Tên của bạn" {...register('name')} />
              {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
            </div>
            <div className="space-y-3">
              <Label>Email</Label>
              <Input type="email" placeholder="email@domain.com" {...register('email')} />
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>
            <div className="space-y-3">
              <Label>Mật khẩu</Label>
              <Input type="password" {...register('password')} />
              {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
            </div>
            <div className="space-y-3">
              <Label>Xác nhận mật khẩu</Label>
              <Input type="password" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>}
            </div>
            <div className="space-y-3">
              <Label>Email học sinh</Label>
              <Input type="email" placeholder="student@domain.com" {...register('guardianStudentEmail')} />
              {errors.guardianStudentEmail && <p className="text-sm text-red-400">{errors.guardianStudentEmail.message}</p>}
            </div>
            <div className="space-y-3">
              <Label>Quan hệ</Label>
              <Input placeholder="Cha/Mẹ/Người giám hộ" {...register('relationship')} />
              {errors.relationship && <p className="text-sm text-red-400">{errors.relationship.message}</p>}
            </div>
            <div className="space-y-3">
              <Label>Số điện thoại</Label>
              <Input placeholder="Số điện thoại" {...register('phone')} />
              {errors.phone && <p className="text-sm text-red-400">{errors.phone.message}</p>}
            </div>
            
            <Button type="submit" className="w-full">Đăng ký</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


