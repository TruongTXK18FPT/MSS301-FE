'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { mindmapService } from "@/lib/services/mindmapService";

interface MindmapCreateFormProps {
  onSuccess?: (mindmap: any) => void;
  onCancel?: () => void;
}

const GRADES = [
  { value: "1", label: "Lớp 1" },
  { value: "2", label: "Lớp 2" },
  { value: "3", label: "Lớp 3" },
  { value: "4", label: "Lớp 4" },
  { value: "5", label: "Lớp 5" },
  { value: "6", label: "Lớp 6" },
  { value: "7", label: "Lớp 7" },
  { value: "8", label: "Lớp 8" },
  { value: "9", label: "Lớp 9" },
  { value: "10", label: "Lớp 10" },
  { value: "11", label: "Lớp 11" },
  { value: "12", label: "Lớp 12" },
];

const SUBJECTS = [
  { value: "toan", label: "Toán học" },
  { value: "ly", label: "Vật lý" },
  { value: "hoa", label: "Hóa học" },
  { value: "sinh", label: "Sinh học" },
  { value: "van", label: "Ngữ văn" },
  { value: "su", label: "Lịch sử" },
  { value: "dia", label: "Địa lý" },
  { value: "anh", label: "Tiếng Anh" },
  { value: "gdcd", label: "Giáo dục công dân" },
];

const AI_PROVIDERS = [
  { value: "MISTRAL", label: "Mistral AI", description: "Tốc độ nhanh, phù hợp cho nội dung cơ bản" },
  { value: "GEMINI", label: "Google Gemini", description: "Chất lượng cao, phù hợp cho nội dung phức tạp" },
];

export default function MindmapCreateForm({ onSuccess, onCancel }: MindmapCreateFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: '',
    subject: '',
    aiProvider: 'GEMINI',
    aiModel: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.grade || !formData.subject) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      // Tạo mindmap với AI
      const result = await mindmapService.generateMindmapWithAi({
        topic: formData.title,
        description: formData.description,
        grade: formData.grade,
        subject: formData.subject,
        aiProvider: formData.aiProvider as 'MISTRAL' | 'GEMINI',
        aiModel: formData.aiModel || undefined
      });

      setSuccess('Tạo mindmap thành công!');
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: any) {
      console.error('Error creating mindmap:', error);
      setError(error.message || 'Có lỗi xảy ra khi tạo mindmap');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.grade || !formData.subject) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      // Tạo mindmap thủ công
      const result = await mindmapService.createMindmap({
        title: formData.title,
        description: formData.description,
        grade: formData.grade,
        subject: formData.subject
      });

      setSuccess('Tạo mindmap thành công!');
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: any) {
      console.error('Error creating mindmap:', error);
      setError(error.message || 'Có lỗi xảy ra khi tạo mindmap');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Tạo Mindmap Mới
          </CardTitle>
          <CardDescription>
            Tạo mindmap với AI hoặc tạo thủ công để bắt đầu học tập
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin cơ bản */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Chủ đề mindmap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ví dụ: Phương trình bậc hai, Hình học phẳng..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Mô tả (tùy chọn)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả ngắn gọn về nội dung mindmap..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade" className="text-sm font-medium">
                    Lớp học <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn lớp" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((grade) => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-sm font-medium">
                    Môn học <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn môn" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((subject) => (
                        <SelectItem key={subject.value} value={subject.value}>
                          {subject.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Cấu hình AI */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Cấu hình AI</h3>
              </div>

              <div>
                <Label htmlFor="aiProvider" className="text-sm font-medium">
                  AI Provider
                </Label>
                <Select value={formData.aiProvider} onValueChange={(value) => handleInputChange('aiProvider', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn AI provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div>
                          <div className="font-medium">{provider.label}</div>
                          <div className="text-sm text-gray-500">{provider.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="aiModel" className="text-sm font-medium">
                  AI Model (tùy chọn)
                </Label>
                <Input
                  id="aiModel"
                  placeholder="Để trống để sử dụng model mặc định"
                  value={formData.aiModel}
                  onChange={(e) => handleInputChange('aiModel', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Thông báo lỗi/thành công */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">{success}</span>
              </div>
            )}

            {/* Nút hành động */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isGenerating}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo với AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Tạo với AI
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleManualCreate}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Tạo thủ công
                  </>
                )}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  disabled={isGenerating}
                >
                  Hủy
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
