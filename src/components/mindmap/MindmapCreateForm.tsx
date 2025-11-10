'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Sparkles, Loader2, CheckCircle, AlertCircle, 
  GraduationCap, BookOpen, Clock, Target, Zap, 
  Info, Lightbulb, TrendingUp, Eye, Lock, Globe, Users, Check
} from "lucide-react";
import { mindmapService } from "@/lib/services/mindmapService";
import { useAuth } from "@/context/auth-context";

interface MindmapCreateFormProps {
  onSuccess?: (mindmap: any) => void;
  onCancel?: () => void;
}

const GRADES = [
  { value: "1", label: "Lớp 1", range: "6-7 tuổi" },
  { value: "2", label: "Lớp 2", range: "7-8 tuổi" },
  { value: "3", label: "Lớp 3", range: "8-9 tuổi" },
  { value: "4", label: "Lớp 4", range: "9-10 tuổi" },
  { value: "5", label: "Lớp 5", range: "10-11 tuổi" },
  { value: "6", label: "Lớp 6", range: "11-12 tuổi" },
  { value: "7", label: "Lớp 7", range: "12-13 tuổi" },
  { value: "8", label: "Lớp 8", range: "13-14 tuổi" },
  { value: "9", label: "Lớp 9", range: "14-15 tuổi" },
  { value: "10", label: "Lớp 10", range: "15-16 tuổi" },
  { value: "11", label: "Lớp 11", range: "16-17 tuổi" },
  { value: "12", label: "Lớp 12", range: "17-18 tuổi" },
];

const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Dễ", description: "Kiến thức cơ bản, phù hợp mới bắt đầu", color: "bg-green-500" },
  { value: "medium", label: "Trung bình", description: "Kiến thức nâng cao, cần có nền tảng", color: "bg-yellow-500" },
  { value: "hard", label: "Khó", description: "Kiến thức phức tạp, dành cho nâng cao", color: "bg-red-500" },
  { value: "mixed", label: "Hỗn hợp", description: "Kết hợp nhiều mức độ khác nhau", color: "bg-purple-500" },
];

const COGNITIVE_LEVELS = [
  { value: "nhan-biet", label: "Nhận biết", description: "Ghi nhớ định nghĩa và công thức" },
  { value: "thong-hieu", label: "Thông hiểu", description: "Giải thích và minh họa khái niệm" },
  { value: "van-dung", label: "Vận dụng", description: "Áp dụng vào bài toán thực tế" },
  { value: "van-dung-cao", label: "Vận dụng cao", description: "Phân tích, tổng hợp, sáng tạo" },
];

const AI_PROVIDERS = [
  { value: "GEMINI", label: "Google Gemini 2.0", description: "AI thông minh, tạo mindmap chi tiết 15-20 nodes với nội dung phong phú", icon: Sparkles },
];

export default function MindmapCreateForm({ onSuccess, onCancel }: Readonly<MindmapCreateFormProps>) {
  const { token, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: '',
    subject: 'Toán học',
    difficulty: 'medium',
    estimatedTime: '',
    aiProvider: 'GEMINI',
    aiModel: 'gemini-2.0-flash-exp',
    cognitiveLevel: 'thong-hieu',
    visibility: 'PRIVATE' as 'PRIVATE' | 'PUBLIC' | 'CLASSROOM',
    useDocuments: false, // false = general knowledge (Direct AI), true = based on documents (RAG)
    documentId: '',
    chapterId: '',
    lessonId: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
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

    // Validate document fields if using document-based mindmap
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
        aiProvider: formData.aiProvider as 'GEMINI',
        aiModel: formData.aiModel || 'gemini-2.0-flash-exp',
        visibility: formData.visibility,
        useDocuments: formData.useDocuments
      };

      // Add document fields if using document-based mindmap (RAG flow)
      if (mindmapType === 'document') {
        requestData.useDocuments = true;
        requestData.aiProvider = 'MISTRAL';  // Use Mistral for RAG-based mindmap
        requestData.documentId = parseInt(formData.documentId);
        if (formData.chapterId) requestData.chapterId = parseInt(formData.chapterId);
        if (formData.lessonId) requestData.lessonId = parseInt(formData.lessonId);
      } else {
        // General knowledge - Direct AI flow
        requestData.useDocuments = false;
        requestData.aiProvider = 'GEMINI';  // Use Gemini for direct AI generation
      }

      console.log('[MindmapCreateForm] Sending request:', requestData);
      const result = await mindmapService.generateMindmapWithAi(requestData);
      console.log('[MindmapCreateForm] Result received:', result);

      setSuccess('Tạo mindmap thành công! Đang chuyển trang...');
      
      // Auto-redirect to view the created mindmap after 1 second
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
      
      // Auto-redirect to view the created mindmap after 1 second
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
    <div className="w-full max-w-4xl mx-auto">
      {/* Header với gradient đẹp */}
      <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Tạo Mindmap Mới</h2>
              <p className="text-white/80 text-sm">Chọn loại mindmap và bắt đầu học tập thông minh</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-2xl">
        <CardContent className="p-6">
          {/* Chọn loại Mindmap */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Chọn loại Mindmap
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* General Knowledge Mindmap */}
              <button
                type="button"
                onClick={() => {
                  setMindmapType('general');
                  setFormData(prev => ({ ...prev, useDocuments: false }));
                }}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  mindmapType === 'general'
                    ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-200'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    mindmapType === 'general' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                      Kiến thức Tổng quát
                      {mindmapType === 'general' && (
                        <Badge className="bg-purple-500">Đang chọn</Badge>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Tạo mindmap dựa trên <strong>kiến thức toán học tổng quát</strong> từ Lớp 1-12 theo MOET và kiến thức quốc tế. 
                      Sử dụng <strong>Google Gemini 2.5 Flash</strong> để tạo 15-20 nodes với nội dung chi tiết 200-500 từ/node.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Google Gemini 2.5 Flash
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Không cần tài liệu
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        15-20+ nodes chi tiết
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Có emoji, công thức & bài tập
                      </Badge>
                    </div>
                  </div>
                </div>
              </button>

              {/* Document-based Mindmap */}
              <button
                type="button"
                onClick={() => {
                  setMindmapType('document');
                  setFormData(prev => ({ ...prev, useDocuments: true }));
                }}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  mindmapType === 'document'
                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-200'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    mindmapType === 'document' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                      Theo Giáo trình
                      {mindmapType === 'document' && (
                        <Badge className="bg-blue-500">Đang chọn</Badge>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Tạo mindmap dựa trên <strong>tài liệu giáo trình</strong> đã upload (SGK, bài giảng...). 
                      Sử dụng <strong>RAG Service với Mistral AI</strong> để truy xuất nội dung chính xác từ document.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Mistral AI + RAG Service
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Theo SGK/tài liệu
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        10+ nodes từ tài liệu
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Chuẩn nội dung MOET
                      </Badge>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2 font-medium text-sm transition-all ${
                  activeTab === 'basic' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Info className="inline-block mr-2 h-4 w-4" />
                Thông tin cơ bản
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('advanced')}
                className={`px-4 py-2 font-medium text-sm transition-all ${
                  activeTab === 'advanced' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingUp className="inline-block mr-2 h-4 w-4" />
                Tùy chọn nâng cao
              </button>
            </div>

            {/* Basic Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-5 animate-in fade-in-50 slide-in-from-left-3 duration-300">
                <div className="grid gap-4">
                  <div className="relative group">
                    <Label htmlFor="title" className="text-sm font-semibold mb-2 block">
                      <BookOpen className="inline-block mr-2 h-4 w-4 text-blue-600" />
                      Chủ đề mindmap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="VD: Phương trình bậc hai, Hình học không gian, Đạo hàm..."
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="peer transition-all focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      💡 Nhập tên chủ đề bạn muốn tạo mindmap - AI sẽ tạo 15-20 nodes chi tiết
                    </p>
                  </div>

                  <div className="relative group">
                    <Label htmlFor="description" className="text-sm font-semibold mb-2 block">
                      <Info className="inline-block mr-2 h-4 w-4 text-purple-600" />
                      Mô tả chi tiết (tùy chọn)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="VD: Tôi muốn học về cách giải phương trình bậc hai, công thức nghiệm, biệt thức delta và ứng dụng thực tế..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="transition-all focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      📝 Mô tả thêm về nội dung mindmap để AI tạo chính xác hơn
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grade" className="text-sm font-semibold">
                        <GraduationCap className="inline-block mr-2 h-4 w-4 text-green-600" />
                        Lớp học <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                        <SelectTrigger className="transition-all">
                          <SelectValue placeholder="Chọn lớp" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map((grade) => (
                            <SelectItem key={grade.value} value={grade.value}>
                              <div>
                                <div className="font-medium">{grade.label}</div>
                                <div className="text-xs text-gray-500">{grade.range}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cognitiveLevel" className="text-sm font-semibold">
                        <Target className="inline-block mr-2 h-4 w-4 text-orange-600" />
                        Mức độ tư duy
                      </Label>
                      <Select value={formData.cognitiveLevel} onValueChange={(value) => handleInputChange('cognitiveLevel', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn mức độ" />
                        </SelectTrigger>
                        <SelectContent>
                          {COGNITIVE_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div>
                                <div className="font-medium">{level.label}</div>
                                <div className="text-xs text-gray-500">{level.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      <Zap className="inline-block mr-2 h-4 w-4 text-pink-600" />
                      Độ khó <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DIFFICULTY_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => handleInputChange('difficulty', level.value)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            formData.difficulty === level.value
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md'
                              : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg transform hover:scale-105'
                          }`}
                        >
                          <div className={`w-full h-1 rounded-full mb-2 ${level.color}`}></div>
                          <div className="font-semibold text-sm">{level.label}</div>
                          <div className="text-xs text-gray-600 mt-1">{level.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Document Selection - Only show if mindmapType is 'document' */}
                  {mindmapType === 'document' && (
                    <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Chọn Tài liệu Giáo trình
                      </h4>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="documentId" className="text-sm font-medium">
                            ID Tài liệu
                          </Label>
                          <Input
                            id="documentId"
                            type="number"
                            placeholder="Nhập ID tài liệu (document)"
                            value={formData.documentId}
                            onChange={(e) => handleInputChange('documentId', e.target.value)}
                            className="bg-white"
                          />
                          <p className="text-xs text-gray-600">
                            ID của sách giáo khoa hoặc tài liệu đã upload
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="chapterId" className="text-sm font-medium">
                              ID Chương (tùy chọn)
                            </Label>
                            <Input
                              id="chapterId"
                              type="number"
                              placeholder="ID chương"
                              value={formData.chapterId}
                              onChange={(e) => handleInputChange('chapterId', e.target.value)}
                              className="bg-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lessonId" className="text-sm font-medium">
                              ID Bài học (tùy chọn)
                            </Label>
                            <Input
                              id="lessonId"
                              type="number"
                              placeholder="ID bài học"
                              value={formData.lessonId}
                              onChange={(e) => handleInputChange('lessonId', e.target.value)}
                              className="bg-white"
                            />
                          </div>
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-blue-100 rounded-lg">
                          <Info className="h-4 w-4 text-blue-700 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-800">
                            <strong>Lưu ý:</strong> Mindmap sẽ được tạo dựa trên nội dung từ tài liệu đã chọn. 
                            Nếu không nhập Chapter/Lesson ID, mindmap sẽ tổng hợp toàn bộ tài liệu.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-5 animate-in fade-in-50 slide-in-from-right-3 duration-300">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Công nghệ AI được sử dụng</h4>
                      <p className="text-sm text-blue-800">
                        {mindmapType === 'general' ? (
                          <>
                            <strong>Google Gemini 2.5 Flash</strong> - Model AI tiên tiến nhất với khả năng tạo mindmap chi tiết 15-20 nodes,
                            mỗi node có 200-500 từ với emoji, công thức LaTeX (x², √, ∫), ví dụ cụ thể và bài tập có đáp án.
                            Tự động fallback về Gemini 1.5 Flash hoặc 2.0 Flash nếu cần.
                          </>
                        ) : (
                          <>
                            <strong>Mistral AI + RAG Service</strong> - Sử dụng Retrieval-Augmented Generation để truy xuất nội dung 
                            chính xác từ tài liệu giáo trình (SGK, bài giảng). Đảm bảo mindmap được tạo dựa trên nội dung chuẩn MOET.
                          </>
                        )}
                      </p>
                      <div className="mt-2 text-xs text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded inline-block">
                        {mindmapType === 'general' 
                          ? 'Model: gemini-2.5-flash (primary) → gemini-1.5-flash → gemini-2.0-flash' 
                          : 'Model: mistral-large-latest + RAG'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime" className="text-sm font-semibold">
                      <Clock className="inline-block mr-2 h-4 w-4 text-indigo-600" />
                      Thời gian ước tính
                    </Label>
                    <Select value={formData.estimatedTime} onValueChange={(value) => handleInputChange('estimatedTime', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thời gian học" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 phút - Nhanh</SelectItem>
                        <SelectItem value="30">30 phút - Vừa phải</SelectItem>
                        <SelectItem value="45">45 phút - Chi tiết</SelectItem>
                        <SelectItem value="60">1 tiếng - Toàn diện</SelectItem>
                        <SelectItem value="90">1.5 tiếng - Rất chi tiết</SelectItem>
                        <SelectItem value="120">2 tiếng - Hoàn chỉnh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Thông báo lỗi/thành công */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg animate-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-900 mb-1">Có lỗi xảy ra</div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg animate-in slide-in-from-top-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-green-900 mb-1">Thành công!</div>
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* Nút hành động */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={isGenerating}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                size="lg"
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
                className="flex-1 hover:bg-purple-50 transition-all"
                size="lg"
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
                  className="hover:bg-purple-50 transition-all"
                  size="lg"
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
