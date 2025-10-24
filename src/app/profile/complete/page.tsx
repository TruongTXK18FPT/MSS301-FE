'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AuthAPI } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, User, Phone, Calendar, School, Target, BookOpen, Building, Award, Users, Link as LinkIcon } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileCompletionRequest, StudentProfileData, TeacherProfileData, GuardianProfileData } from "@/types/auth";

// Student Schema
const studentSchema = z.object({
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  birthDate: z.string().min(1, "Vui lòng chọn ngày sinh"),
  school: z.string().optional(),
  grade: z.string().optional(),
  learningGoals: z.string().optional(),
  subjectsOfInterest: z.string().optional(),
});

// Teacher Schema
const teacherSchema = z.object({
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  birthDate: z.string().min(1, "Vui lòng chọn ngày sinh"),
  department: z.string().optional(),
  specialization: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  qualifications: z.string().optional(),
  bio: z.string().optional(),
});

// Guardian Schema
const guardianSchema = z.object({
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  birthDate: z.string().min(1, "Vui lòng chọn ngày sinh"),
  relationship: z.string().optional(),
  studentEmail: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  studentPhone: z.string().optional(),
});

export default function ProfileCompletePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Fetch profile status to get userType
    AuthAPI.getProfileStatus().then(res => {
      if (res.code === 1000 && res.result) {
        setUserType(res.result.userType);
        if (res.result.profileCompleted) {
          toast({ description: "Hồ sơ của bạn đã hoàn thiện!" });
          router.push("/");
        }
      }
    });
  }, [token, router, toast]);

  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/30 p-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-black/30 backdrop-blur-xl border border-pink-500/30 rounded-3xl shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-400 to-pink-400">
              Hoàn thiện hồ sơ
            </CardTitle>
            <CardDescription className="text-pink-200/80 mt-2">
              Vui lòng cung cấp thêm thông tin để hoàn thiện hồ sơ của bạn
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {userType === "STUDENT" && <StudentForm loading={loading} setLoading={setLoading} />}
            {userType === "TEACHER" && <TeacherForm loading={loading} setLoading={setLoading} />}
            {userType === "GUARDIAN" && <GuardianForm loading={loading} setLoading={setLoading} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Student Form Component
function StudentForm({ loading, setLoading }: { loading: boolean; setLoading: (v: boolean) => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload: ProfileCompletionRequest = {
        userType: "STUDENT",
        data: {
          phone: values.phone,
          birthDate: values.birthDate,
          school: values.school,
          grade: values.grade,
          learningGoals: values.learningGoals,
          subjectsOfInterest: values.subjectsOfInterest,
        } as StudentProfileData,
      };
      const res = await AuthAPI.completeProfile(payload);

      if (res.code === 1000) {
        toast({ description: "✅ Hoàn thiện hồ sơ thành công!" });
        router.push("/");
      } else {
        toast({ description: res.message || "Có lỗi xảy ra", variant: "destructive" });
      }
    } catch (error) {
      toast({ description: "Có lỗi xảy ra", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <Phone className="size-4" /> Số điện thoại *
        </Label>
        <Input {...register('phone')} placeholder="0912345678" className="bg-black/40 border-pink-400/30 text-white rounded-xl h-12" />
        {errors.phone && <p className="text-sm text-red-400">{errors.phone.message as string}</p>}
      </div>

      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <Calendar className="size-4" /> Ngày sinh (yyyy-MM-dd) *
        </Label>
        <Input {...register('birthDate')} type="date" className="bg-black/40 border-pink-400/30 text-white rounded-xl h-12" />
        {errors.birthDate && <p className="text-sm text-red-400">{errors.birthDate.message as string}</p>}
      </div>

      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <School className="size-4" /> Trường học
        </Label>
        <Input {...register('school')} placeholder="Tên trường" className="bg-black/40 border-pink-400/30 text-white rounded-xl h-12" />
      </div>

      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <BookOpen className="size-4" /> Lớp
        </Label>
        <Input {...register('grade')} placeholder="10, 11, 12..." className="bg-black/40 border-pink-400/30 text-white rounded-xl h-12" />
      </div>

      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <Target className="size-4" /> Mục tiêu học tập
        </Label>
        <Textarea {...register('learningGoals')} placeholder="Mô tả mục tiêu..." className="bg-black/40 border-pink-400/30 text-white rounded-xl" />
      </div>

      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <BookOpen className="size-4" /> Môn học quan tâm
        </Label>
        <Textarea {...register('subjectsOfInterest')} placeholder="Toán, Lý, Hóa..." className="bg-black/40 border-pink-400/30 text-white rounded-xl" />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 rounded-xl">
        {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle className="mr-2" /> Hoàn tất</>}
      </Button>
    </form>
  );
}

// Teacher Form Component
function TeacherForm({ loading, setLoading }: { loading: boolean; setLoading: (v: boolean) => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(teacherSchema),
  });

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload: ProfileCompletionRequest = {
        userType: "TEACHER",
        data: {
          phone: values.phone,
          birthDate: values.birthDate,
          department: values.department,
          specialization: values.specialization,
          yearsOfExperience: values.yearsOfExperience ? parseInt(values.yearsOfExperience) : undefined,
          qualifications: values.qualifications,
          bio: values.bio,
        } as TeacherProfileData,
      };
      const res = await AuthAPI.completeProfile(payload);

      if (res.code === 1000) {
        toast({ description: "✅ Hoàn thiện hồ sơ thành công!" });
        router.push("/");
      } else {
        toast({ description: res.message || "Có lỗi xảy ra", variant: "destructive" });
      }
    } catch (error) {
      toast({ description: "Có lỗi xảy ra", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <Phone className="size-4" /> Số điện thoại *
        </Label>
        <Input {...register('phone')} placeholder="0912345678" className="bg-black/40 border-pink-400/30 text-white rounded-xl h-12" />
        {errors.phone && <p className="text-sm text-red-400">{errors.phone.message as string}</p>}
      </div>

      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <Calendar className="size-4" /> Ngày sinh (yyyy-MM-dd) *
        </Label>
        <Input {...register('birthDate')} type="date" className="bg-black/40 border-pink-400/30 text-white rounded-xl h-12" />
        {errors.birthDate && <p className="text-sm text-red-400">{errors.birthDate.message as string}</p>}
      </div>

      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <Building className="size-4" /> Khoa/Bộ môn
        </Label>
        <Input {...register('department')} placeholder="Toán, Lý..." className="bg-black/40 border-pink-400/30 text-white rounded-xl h-12" />
      </div>

      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <Award className="size-4" /> Chuyên môn
        </Label>
        <Input {...register('specialization')} placeholder="Đại số, Hình học..." className="bg-black/40 border-pink-400/30 text-white rounded-xl h-12" />
      </div>

      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <Calendar className="size-4" /> Số năm kinh nghiệm
        </Label>
        <Input {...register('yearsOfExperience')} type="number" placeholder="5" className="bg-black/40 border-pink-400/30 text-white rounded-xl h-12" />
      </div>

      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <Award className="size-4" /> Bằng cấp/Chứng chỉ
        </Label>
        <Textarea {...register('qualifications')} placeholder="Thạc sĩ Toán học..." className="bg-black/40 border-pink-400/30 text-white rounded-xl" />
      </div>

      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <User className="size-4" /> Giới thiệu bản thân
        </Label>
        <Textarea {...register('bio')} placeholder="Mô tả ngắn về bản thân..." className="bg-black/40 border-pink-400/30 text-white rounded-xl" />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 rounded-xl">
        {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle className="mr-2" /> Hoàn tất</>}
      </Button>
    </form>
  );
}

// Guardian Form Component
function GuardianForm({ loading, setLoading }: { loading: boolean; setLoading: (v: boolean) => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(guardianSchema),
  });

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload: ProfileCompletionRequest = {
        userType: "GUARDIAN",
        data: {
          phone: values.phone,
          birthDate: values.birthDate,
          relationship: values.relationship,
          studentEmail: values.studentEmail || undefined,
          studentPhone: values.studentPhone || undefined,
        } as GuardianProfileData,
      };
      const res = await AuthAPI.completeProfile(payload);

      if (res.code === 1000) {
        toast({ description: "✅ Hoàn thiện hồ sơ thành công!" });
        router.push("/");
      } else {
        toast({ description: res.message || "Có lỗi xảy ra", variant: "destructive" });
      }
    } catch (error) {
      toast({ description: "Có lỗi xảy ra", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <Phone className="size-4" /> Số điện thoại *
        </Label>
        <Input {...register('phone')} placeholder="0912345678" className="bg-black/40 border-pink-400/30 text-white rounded-xl h-12" />
        {errors.phone && <p className="text-sm text-red-400">{errors.phone.message as string}</p>}
      </div>

      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <Calendar className="size-4" /> Ngày sinh (yyyy-MM-dd) *
        </Label>
        <Input {...register('birthDate')} type="date" className="bg-black/40 border-pink-400/30 text-white rounded-xl h-12" />
        {errors.birthDate && <p className="text-sm text-red-400">{errors.birthDate.message as string}</p>}
      </div>

      <div className="space-y-3">
        <Label className="text-pink-200 flex items-center gap-2">
          <Users className="size-4" /> Quan hệ với học sinh
        </Label>
        <Input {...register('relationship')} placeholder="Cha, Mẹ, Anh, Chị..." className="bg-black/40 border-pink-400/30 text-white rounded-xl h-12" />
      </div>

      <div className="bg-violet-500/10 border border-violet-400/30 rounded-xl p-4 space-y-3">
        <p className="text-violet-300 text-sm font-medium flex items-center gap-2">
          <LinkIcon className="size-4" /> Liên kết với học sinh (tùy chọn)
        </p>
        <p className="text-pink-200/70 text-xs">Nếu bạn muốn liên kết với tài khoản học sinh, vui lòng cung cấp email và số điện thoại của học sinh</p>
        
        <div className="space-y-3">
          <Label className="text-pink-200 text-sm">Email học sinh</Label>
          <Input {...register('studentEmail')} type="email" placeholder="student@email.com" className="bg-black/40 border-pink-400/30 text-white rounded-xl h-10" />
          {errors.studentEmail && <p className="text-sm text-red-400">{errors.studentEmail.message as string}</p>}
        </div>

        <div className="space-y-3">
          <Label className="text-pink-200 text-sm">Số điện thoại học sinh</Label>
          <Input {...register('studentPhone')} placeholder="0912345678" className="bg-black/40 border-pink-400/30 text-white rounded-xl h-10" />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 rounded-xl">
        {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle className="mr-2" /> Hoàn tất</>}
      </Button>
    </form>
  );
}