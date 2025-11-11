'use client';

import React, { useState } from 'react';
import { Brain, Sparkles, BookOpen, Loader2, CheckCircle, AlertCircle, GraduationCap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mindmapService } from '@/lib/services/mindmapService';

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

export default function MindmapCreateForm({ onSuccess, onCancel }: Readonly<MindmapCreateFormProps>) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: '',
    subject: 'Toán học',
    visibility: 'PRIVATE' as 'PRIVATE' | 'PUBLIC' | 'CLASSROOM',
    useDocuments: false,
    documentId: '',
    chapterId: '',
    lessonId: '',
    difficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED',
    thinkingLevel: 'UNDERSTAND' as 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'MIXED'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mindmapType, setMindmapType] = useState<'general' | 'document'>('general');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.grade) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (mindmapType === 'document' && !formData.documentId) {
      setError('Vui lòng nhập ID tài liệu khi chọn tạo theo giáo trình');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const requestData: any = {
        topic: formData.title,
        description: formData.description || `Mindmap về ${formData.title} cho lớp ${formData.grade}`,
        grade: formData.grade,
        subject: formData.subject,
        aiProvider: mindmapType === 'document' ? 'MISTRAL' : 'GEMINI',
        aiModel: mindmapType === 'document' ? 'mistral-large-latest' : 'gemini-2.0-flash-exp',
        visibility: formData.visibility,
        useDocuments: mindmapType === 'document',
        difficulty: formData.difficulty,
        thinkingLevel: formData.thinkingLevel
      };

      if (mindmapType === 'document') {
        requestData.documentId = parseInt(formData.documentId);
        if (formData.chapterId) requestData.chapterId = parseInt(formData.chapterId);
        if (formData.lessonId) requestData.lessonId = parseInt(formData.lessonId);
      }

      const result = await mindmapService.generateMindmapWithAi(requestData);
      setSuccess('Tạo mindmap thành công! Đang chuyển trang...');
      
      setTimeout(() => {
        window.location.href = `/mindmap/${result.id}`;
      }, 1000);
      
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
    
    if (!formData.title.trim() || !formData.grade) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const result = await mindmapService.createMindmap({
        title: formData.title,
        description: formData.description,
        grade: formData.grade,
        subject: formData.subject,
        visibility: formData.visibility
      });

      setSuccess('Tạo mindmap thành công! Đang chuyển trang...');
      
      setTimeout(() => {
        window.location.href = `/mindmap/${result.id}`;
      }, 1000);
      
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
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Header với gradient đẹp */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white mb-6 shadow-xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Tạo Mindmap Mới</h2>
            <div className="text-white/90 text-sm mt-1">Chọn loại mindmap và bắt đầu học tập thông minh</div>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <CardContent className="p-8">
          {/* Chọn loại Mindmap */}
          <div className="mb-8 pb-6 border-b border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
              Chọn loại Mindmap
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* General Knowledge */}
              <button
                type="button"
                onClick={() => {
                  setMindmapType('general');
                  setFormData(prev => ({ ...prev, useDocuments: false }));
                }}
                className={`p-5 rounded-xl border-2 transition-all text-left ${
                  mindmapType === 'general'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-900/40 to-purple-800/40 shadow-xl shadow-purple-500/20'
                    : 'border-slate-600 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg transition-all ${
                    mindmapType === 'general'
                      ? 'bg-purple-500/80 text-white shadow-lg shadow-purple-500/40'
                      : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base mb-1.5 text-white">
                      Kiến thức Tổng quát
                      {mindmapType === 'general' && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full">✓</span>
                      )}
                    </h4>
                    <div className="text-sm text-gray-300 mb-2.5 leading-relaxed">
                      AI tạo mindmap từ kiến thức tổng hợp, 15-20 nodes với nội dung chi tiết
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30">✨ AI mạnh</span>
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-md border border-green-500/30">📚 Chi tiết</span>
                      <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded-md border border-orange-500/30">🚀 Nhanh</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Document-based */}
              <button
                type="button"
                onClick={() => {
                  setMindmapType('document');
                  setFormData(prev => ({ ...prev, useDocuments: true }));
                }}
                className={`p-5 rounded-xl border-2 transition-all text-left ${
                  mindmapType === 'document'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-900/40 to-blue-800/40 shadow-xl shadow-blue-500/20'
                    : 'border-slate-600 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg transition-all ${
                    mindmapType === 'document'
                      ? 'bg-blue-500/80 text-white shadow-lg shadow-blue-500/40'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base mb-1.5 text-white">
                      Theo Giáo trình
                      {mindmapType === 'document' && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">✓</span>
                      )}
                    </h4>
                    <div className="text-sm text-gray-300 mb-2.5 leading-relaxed">
                      Tạo từ tài liệu đã upload (PDF, Word), phù hợp ôn tập theo giáo trình
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30">📄 Tài liệu</span>
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-md border border-green-500/30">🎓 Giáo trình</span>
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md border border-purple-500/30">🔍 Chính xác</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Chủ đề */}
            <div className="relative group">
              <Label htmlFor="title" className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-400" />
                Chủ đề <span className="text-red-400">*</span>
              </Label>
              <Input
                id="title"
                placeholder="VD: Phương trình bậc hai, Hình học không gian, Đạo hàm..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="h-12 bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/50"
              />
              <div className="text-xs text-gray-500 mt-1.5">💡 Nhập tên chủ đề mà bạn muốn tạo mindmap - AI sẽ tạo chính xác nội dung chi tiết 15-20 nodes về chủ đề này</div>
            </div>

            {/* Mô tả chi tiết */}
            <div className="relative group">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <span className="text-emerald-400">📝</span>
                Mô tả chi tiết (tùy chọn)
              </Label>
              <Textarea
                id="description"
                placeholder="VD: Tôi muốn học về cách giải phương trình bậc hai, công thức nghiệm, biệt thức delta và ứng dụng thực tế..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/50 resize-none"
              />
              <div className="text-xs text-gray-500 mt-1.5">✨ Mô tả thêm về nội dung mindmap để AI tạo chính xác hơn</div>
            </div>

            {/* Row: Lớp và Môn học */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="grade" className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-400" />
                  Lớp <span className="text-red-400">*</span>
                </Label>
                <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                  <SelectTrigger className="h-12 bg-slate-800/50 border-slate-600 text-white">
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {GRADES.map(grade => (
                      <SelectItem key={grade.value} value={grade.value} className="text-white hover:bg-slate-700">
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject" className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <span className="text-orange-400">📚</span>
                  Môn học
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="h-12 bg-slate-800/50 border-slate-600 text-white focus:border-purple-500 focus:ring-purple-500/50"
                />
              </div>
            </div>

            {/* Độ khó - chỉ hiện khi chọn General */}
            {mindmapType === 'general' && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <span className="text-yellow-400">⚡</span>
                  Độ khó <span className="text-red-400">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('difficulty', 'EASY')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.difficulty === 'EASY'
                        ? 'border-green-500 bg-gradient-to-br from-green-900/50 to-green-800/50 shadow-lg shadow-green-500/20'
                        : 'border-slate-600 bg-slate-800/30 hover:border-green-500/60'
                    }`}
                  >
                    <div className={`text-2xl mb-1.5 ${formData.difficulty === 'EASY' ? 'text-green-400' : 'text-gray-500'}`}>🟢</div>
                    <div className={`font-bold text-sm ${formData.difficulty === 'EASY' ? 'text-white' : 'text-gray-400'}`}>Dễ</div>
                    <div className="text-xs text-gray-500 mt-1">Kiến thức cơ bản</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('difficulty', 'MEDIUM')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.difficulty === 'MEDIUM'
                        ? 'border-yellow-500 bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 shadow-lg shadow-yellow-500/20'
                        : 'border-slate-600 bg-slate-800/30 hover:border-yellow-500/60'
                    }`}
                  >
                    <div className={`text-2xl mb-1.5 ${formData.difficulty === 'MEDIUM' ? 'text-yellow-400' : 'text-gray-500'}`}>🟡</div>
                    <div className={`font-bold text-sm ${formData.difficulty === 'MEDIUM' ? 'text-white' : 'text-gray-400'}`}>Trung bình</div>
                    <div className="text-xs text-gray-500 mt-1">Kiến thức nâng cao</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('difficulty', 'HARD')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.difficulty === 'HARD'
                        ? 'border-red-500 bg-gradient-to-br from-red-900/50 to-red-800/50 shadow-lg shadow-red-500/20'
                        : 'border-slate-600 bg-slate-800/30 hover:border-red-500/60'
                    }`}
                  >
                    <div className={`text-2xl mb-1.5 ${formData.difficulty === 'HARD' ? 'text-red-400' : 'text-gray-500'}`}>🔴</div>
                    <div className={`font-bold text-sm ${formData.difficulty === 'HARD' ? 'text-white' : 'text-gray-400'}`}>Khó</div>
                    <div className="text-xs text-gray-500 mt-1">Kiến thức phức tạp</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('difficulty', 'MIXED')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.difficulty === 'MIXED'
                        ? 'border-purple-500 bg-gradient-to-br from-purple-900/50 to-purple-800/50 shadow-lg shadow-purple-500/20'
                        : 'border-slate-600 bg-slate-800/30 hover:border-purple-500/60'
                    }`}
                  >
                    <div className={`text-2xl mb-1.5 ${formData.difficulty === 'MIXED' ? 'text-purple-400' : 'text-gray-500'}`}>🟣</div>
                    <div className={`font-bold text-sm ${formData.difficulty === 'MIXED' ? 'text-white' : 'text-gray-400'}`}>Hỗn hợp</div>
                    <div className="text-xs text-gray-500 mt-1">Kết hợp nhiều mức độ khác nhau</div>
                  </button>
                </div>
              </div>
            )}

            {/* Mức độ tư duy - chỉ hiện khi chọn General */}
            {mindmapType === 'general' && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <span className="text-cyan-400">🎯</span>
                  Mức độ tư duy
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('thinkingLevel', 'REMEMBER')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.thinkingLevel === 'REMEMBER'
                        ? 'border-blue-500 bg-gradient-to-br from-blue-900/50 to-blue-800/50 shadow-lg shadow-blue-500/20'
                        : 'border-slate-600 bg-slate-800/30 hover:border-blue-500/60'
                    }`}
                  >
                    <div className={`text-2xl mb-1.5 ${formData.thinkingLevel === 'REMEMBER' ? 'text-blue-400' : 'text-gray-500'}`}>📚</div>
                    <div className={`font-bold text-sm ${formData.thinkingLevel === 'REMEMBER' ? 'text-white' : 'text-gray-400'}`}>Ghi nhớ</div>
                    <div className="text-xs text-gray-500 mt-1">Nhớ lại kiến thức</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('thinkingLevel', 'UNDERSTAND')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.thinkingLevel === 'UNDERSTAND'
                        ? 'border-green-500 bg-gradient-to-br from-green-900/50 to-green-800/50 shadow-lg shadow-green-500/20'
                        : 'border-slate-600 bg-slate-800/30 hover:border-green-500/60'
                    }`}
                  >
                    <div className={`text-2xl mb-1.5 ${formData.thinkingLevel === 'UNDERSTAND' ? 'text-green-400' : 'text-gray-500'}`}>💡</div>
                    <div className={`font-bold text-sm ${formData.thinkingLevel === 'UNDERSTAND' ? 'text-white' : 'text-gray-400'}`}>Hiểu</div>
                    <div className="text-xs text-gray-500 mt-1">Hiểu khái niệm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('thinkingLevel', 'APPLY')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.thinkingLevel === 'APPLY'
                        ? 'border-orange-500 bg-gradient-to-br from-orange-900/50 to-orange-800/50 shadow-lg shadow-orange-500/20'
                        : 'border-slate-600 bg-slate-800/30 hover:border-orange-500/60'
                    }`}
                  >
                    <div className={`text-2xl mb-1.5 ${formData.thinkingLevel === 'APPLY' ? 'text-orange-400' : 'text-gray-500'}`}>🔧</div>
                    <div className={`font-bold text-sm ${formData.thinkingLevel === 'APPLY' ? 'text-white' : 'text-gray-400'}`}>Áp dụng</div>
                    <div className="text-xs text-gray-500 mt-1">Vận dụng thực tế</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('thinkingLevel', 'MIXED')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.thinkingLevel === 'MIXED'
                        ? 'border-purple-500 bg-gradient-to-br from-purple-900/50 to-purple-800/50 shadow-lg shadow-purple-500/20'
                        : 'border-slate-600 bg-slate-800/30 hover:border-purple-500/60'
                    }`}
                  >
                    <div className={`text-2xl mb-1.5 ${formData.thinkingLevel === 'MIXED' ? 'text-purple-400' : 'text-gray-500'}`}>🌟</div>
                    <div className={`font-bold text-sm ${formData.thinkingLevel === 'MIXED' ? 'text-white' : 'text-gray-400'}`}>Đa dạng</div>
                    <div className="text-xs text-gray-500 mt-1">Kết hợp các mức độ</div>
                  </button>
                </div>
              </div>
            )}

            {/* Document fields if selected */}
            {mindmapType === 'document' && (
              <div className="space-y-4 p-5 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Thông tin tài liệu
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="documentId" className="text-sm text-gray-300 mb-1.5">
                      ID Tài liệu <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="documentId"
                      type="number"
                      placeholder="Nhập ID"
                      value={formData.documentId}
                      onChange={(e) => handleInputChange('documentId', e.target.value)}
                      className="h-10 bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chapterId" className="text-sm text-gray-400 mb-1.5">ID Chương</Label>
                    <Input
                      id="chapterId"
                      type="number"
                      placeholder="Tùy chọn"
                      value={formData.chapterId}
                      onChange={(e) => handleInputChange('chapterId', e.target.value)}
                      className="h-10 bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lessonId" className="text-sm text-gray-400 mb-1.5">ID Bài học</Label>
                    <Input
                      id="lessonId"
                      type="number"
                      placeholder="Tùy chọn"
                      value={formData.lessonId}
                      onChange={(e) => handleInputChange('lessonId', e.target.value)}
                      className="h-10 bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error/Success messages */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-300 text-sm">Có lỗi xảy ra</div>
                  <div className="text-sm text-red-400 mt-1">{error}</div>
                </div>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-green-300 text-sm">Thành công!</div>
                  <div className="text-sm text-green-400 mt-1">{success}</div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-6 border-t border-slate-700">
              <Button
                type="submit"
                disabled={isGenerating}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl h-12 text-base font-semibold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang tạo với AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Tạo với AI
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleManualCreate}
                disabled={isGenerating}
                className="flex-1 border-2 border-slate-600 bg-slate-800/50 text-gray-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white h-12 text-base font-semibold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
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
                  className="text-gray-400 hover:text-white hover:bg-slate-700 h-12 text-base font-semibold"
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
