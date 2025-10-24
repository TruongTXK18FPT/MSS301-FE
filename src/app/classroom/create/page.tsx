'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  GraduationCap, 
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Users,
  Lock,
  Globe
} from "lucide-react";
import { classroomService } from '@/services/classroom.service';
import { CreateClassroomRequest } from '@/types/classroom';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function CreateClassroomPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<CreateClassroomRequest>({
    name: '',
    description: '',
    isPublic: false,
    password: '',
    maxStudents: 50
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên lớp học.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const classroom = await classroomService.createClassroom(formData);
      
      toast({
        title: "Thành công",
        description: "Đã tạo lớp học thành công."
      });
      
      router.push(`/classroom/${classroom.id}`);
    } catch (error: any) {
      console.error('Error creating classroom:', error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tạo lớp học. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateClassroomRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-blue-900/20 to-indigo-900/20"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/classroom/teacher">
              <Button variant="outline" className="bg-black/30 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/20">
                <ArrowLeft className="size-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse">
              <GraduationCap className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 animate-gradient">
                Tạo lớp học mới
              </h1>
              <p className="text-emerald-200/80">Thiết lập lớp học và mời học sinh tham gia</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <GraduationCap className="size-5 text-emerald-400" />
                Thông tin lớp học
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tên lớp học */}
                <div className="space-y-2">
                  <Label className="text-emerald-200 font-medium">Tên lớp học *</Label>
                  <Input
                    placeholder="Ví dụ: Toán 9A, Lý 10B..."
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-black/40 border-emerald-400/30 text-white rounded-xl backdrop-blur-sm focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                {/* Mô tả */}
                <div className="space-y-2">
                  <Label className="text-emerald-200 font-medium">Mô tả</Label>
                  <Textarea
                    placeholder="Mô tả về lớp học, mục tiêu học tập..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-black/40 border-emerald-400/30 text-white rounded-xl backdrop-blur-sm focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/20"
                    rows={3}
                  />
                </div>

                {/* Số học sinh tối đa */}
                <div className="space-y-2">
                  <Label className="text-emerald-200 font-medium flex items-center gap-2">
                    <Users className="size-4" />
                    Số học sinh tối đa
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="200"
                    value={formData.maxStudents}
                    onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 50)}
                    className="bg-black/40 border-emerald-400/30 text-white rounded-xl backdrop-blur-sm focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Công khai/Riêng tư */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <Globe className="size-5 text-emerald-400" />
                      <div>
                        <Label className="text-emerald-200 font-medium">Lớp học công khai</Label>
                        <p className="text-emerald-200/70 text-sm">Học sinh có thể tìm thấy và tham gia lớp học</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                    />
                  </div>
                </div>

                {/* Mật khẩu */}
                <div className="space-y-2">
                  <Label className="text-emerald-200 font-medium flex items-center gap-2">
                    <Lock className="size-4" />
                    Mật khẩu lớp học
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu để bảo vệ lớp học"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-black/40 border-emerald-400/30 text-white rounded-xl backdrop-blur-sm focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <p className="text-emerald-200/60 text-sm">
                    Mật khẩu giúp bảo vệ lớp học khỏi những người không mong muốn
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang tạo...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="size-4" />
                        Tạo lớp học
                      </div>
                    )}
                  </Button>
                  
                  <Link href="/classroom/teacher" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-black/30 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/20 rounded-xl"
                    >
                      Hủy
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
