'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthAPI } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterRequest } from "@/types/auth";

const schema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  department: z.string().min(1, "Vui lòng nhập tổ/bộ môn"),
  specialization: z.string().min(1, "Vui lòng nhập chuyên môn"),
  yearsOfExperience: z.coerce.number().min(0),
  qualifications: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type TeacherForm = z.infer<typeof schema>;

export default function TeacherRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<TeacherForm>({ resolver: zodResolver(schema) });
  // Removed province/ward fetching for shorter form

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-black/30 backdrop-blur-xl border border-pink-500/30 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-center">Đăng ký giáo viên</CardTitle>
          <CardDescription className="text-center">Vui lòng điền thông tin cơ bản</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(async (values) => {
            const payload: RegisterRequest = {
              fullName: values.name,
              email: values.email,
              password: values.password,
              confirmPassword: values.confirmPassword,
              userType: 'TEACHER',
              // Teacher full profile is captured here but base register only needs basic fields.
              // We'll still send base payload for registration, and the rest will be sent via complete-profile after login when approved.
            };
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
              <Input type={showPassword ? 'text' : 'password'} {...register('password')} />
              {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
            </div>
            <div className="space-y-3">
              <Label>Xác nhận mật khẩu</Label>
              <Input type={showPassword ? 'text' : 'password'} {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>}
            </div>
            <div className="space-y-3">
              <Label>Tổ/Bộ môn</Label>
              <Input placeholder="Toán/Lý/Hóa..." {...register('department')} />
              {errors.department && <p className="text-sm text-red-400">{errors.department.message}</p>}
            </div>
            <div className="space-y-3">
              <Label>Chuyên môn</Label>
              <Input placeholder="Đại số, Hình học..." {...register('specialization')} />
              {errors.specialization && <p className="text-sm text-red-400">{errors.specialization.message}</p>}
            </div>
            <div className="space-y-3">
              <Label>Kinh nghiệm (năm)</Label>
              <Input type="number" {...register('yearsOfExperience')} />
            </div>
            <div className="space-y-3">
              <Label>Trình độ/Chứng chỉ</Label>
              <Textarea {...register('qualifications')} />
            </div>
            <div className="space-y-3">
              <Label>Giới thiệu</Label>
              <Textarea {...register('bio')} />
            </div>

            <div className="space-y-3">
              <Label>Số điện thoại</Label>
              <Input placeholder="Số điện thoại" {...register('phone')} />
            </div>
            {/* Address and location fields removed for shorter initial form */}
            <Button type="submit" className="w-full">Đăng ký</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


