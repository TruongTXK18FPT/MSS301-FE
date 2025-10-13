'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthAPI } from "@/services/auth.service";
import { AddressAPI } from "@/services/address.service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
  birthDate: z.string().min(1, "Vui lòng chọn ngày sinh"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  provinceCode: z.string().min(1, "Chọn tỉnh/TP"),
  wardCode: z.string().min(1, "Chọn phường/xã"),
});

type TeacherForm = z.infer<typeof schema>;

export default function TeacherRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<TeacherForm>({ resolver: zodResolver(schema) });
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  useEffect(() => { (async () => {
    const res = await AddressAPI.getProvinces();
    if (res.code === 1000 && res.result?.data) setProvinces(res.result.data);
  })(); }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-black/30 backdrop-blur-xl border border-pink-500/30 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-center">Đăng ký giáo viên</CardTitle>
          <CardDescription className="text-center">Vui lòng điền thông tin cơ bản</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(async (values) => {
            const [d, m, y] = values.birthDate.split('/');
            const birth = `${y}-${m}-${d}`;
            const payload = {
              username: values.name || values.email.split('@')[0],
              fullName: values.name,
              email: values.email,
              password: values.password,
              confirmPassword: values.password,
              userType: 'TEACHER' as const,
              department: values.department,
              specialization: values.specialization,
              yearsOfExperience: values.yearsOfExperience,
              qualifications: values.qualifications,
              bio: values.bio,
              phone: values.phone,
              birthDate: birth,
              address: values.address,
              provinceCode: Number(values.provinceCode),
              wardCode: values.wardCode,
              tenantId: null,
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Số điện thoại</Label>
                <Input placeholder="Số điện thoại" {...register('phone')} />
              </div>
              <div className="space-y-3">
                <Label>Ngày sinh (dd/MM/yyyy)</Label>
                <Input placeholder="dd/MM/yyyy" {...register('birthDate')} />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Địa chỉ</Label>
              <Textarea {...register('address')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Tỉnh/TP</Label>
                <select className="w-full rounded-md bg-black/30 p-2" {...register('provinceCode')} onChange={async (e) => {
                  const code = e.target.value;
                  const resp = await AddressAPI.getWardsByProvince(code);
                  if (resp.code === 1000 && resp.result?.data) setWards(resp.result.data);
                }}>
                  <option value="">Chọn tỉnh/TP</option>
                  {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <Label>Phường/Xã</Label>
                <select className="w-full rounded-md bg-black/30 p-2" {...register('wardCode')}>
                  <option value="">Chọn phường/xã</option>
                  {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full">Đăng ký</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


