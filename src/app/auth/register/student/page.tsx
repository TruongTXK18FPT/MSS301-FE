'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthAPI } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  username: z.string().min(3, "Tên đăng nhập tối thiểu 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu"),
  studentClass: z.string().min(1, "Vui lòng nhập lớp hiện tại"),
  learningGoals: z.string().min(1, "Vui lòng nhập mục tiêu học tập"),
}).refine((d) => d.password === d.confirmPassword, { message: "Mật khẩu không khớp", path: ["confirmPassword"] });

type StudentRegisterForm = z.infer<typeof schema>;

export default function StudentRegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<StudentRegisterForm>({ resolver: zodResolver(schema) });

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-black/30 backdrop-blur-xl border border-pink-500/30 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-center">Đăng ký học sinh</CardTitle>
          <CardDescription className="text-center">Điền thông tin cơ bản để bắt đầu</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(async (values) => {
            setSubmitting(true);
            const payload = {
              fullName: values.fullName,
              username: values.username,
              email: values.email,
              password: values.password,
              confirmPassword: values.confirmPassword,
              userType: 'STUDENT' as const,
            };
            const res = await AuthAPI.register(payload);
            if (res.code === 1000) {
              toast({ description: 'Đăng ký thành công. Vui lòng kiểm tra email để nhập OTP.' });
              router.push('/auth/verify-otp?email=' + encodeURIComponent(values.email));
            } else {
              toast({ description: res.message || 'Đăng ký thất bại', variant: 'destructive' });
            }
            setSubmitting(false);
          })}>
            <div className="space-y-3">
              <Label>Họ và Tên</Label>
              <Input placeholder="Nguyễn Văn A" {...register('fullName')} />
              {errors.fullName && <p className="text-sm text-red-400">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-3">
              <Label>Tên đăng nhập</Label>
              <Input placeholder="username123" {...register('username')} />
              {errors.username && <p className="text-sm text-red-400">{errors.username.message}</p>}
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
              <Label>Lớp hiện tại</Label>
              <Input placeholder="VD: 10A1" {...register('studentClass')} />
              {errors.studentClass && <p className="text-sm text-red-400">{errors.studentClass.message}</p>}
            </div>
            <div className="space-y-3">
              <Label>Mục tiêu học tập</Label>
              <Textarea placeholder="VD: Ôn thi học sinh giỏi, cải thiện điểm hình học..." {...register('learningGoals')} />
              {errors.learningGoals && <p className="text-sm text-red-400">{errors.learningGoals.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>Tạo tài khoản</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


