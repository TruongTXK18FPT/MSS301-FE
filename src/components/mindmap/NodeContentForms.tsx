'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';
import MathTextInput from '@/components/classroom/MathTextInput';
import { ConceptRequest, FormulaRequest, ExerciseRequest } from '@/lib/dto/mindmap';

interface ConceptFormProps {
  nodeId: number;
  onSubmit: (data: ConceptRequest) => Promise<void>;
  onCancel: () => void;
}

export function ConceptForm({ nodeId, onSubmit, onCancel }: ConceptFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nodeId,
    conceptName: '',
    definition: '',
    explanation: '',
    keyPoints: '',
    examples: '',
    commonMistakes: '',
    tips: '',
    prerequisites: '',
    relatedConcepts: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Parse string arrays
      const parseLines = (text: string) => 
        text ? text.split('\n').filter(line => line.trim()) : undefined;

      await onSubmit({
        nodeId: formData.nodeId,
        conceptName: formData.conceptName,
        definition: formData.definition,
        explanation: formData.explanation || undefined,
        keyPoints: parseLines(formData.keyPoints),
        examples: parseLines(formData.examples),
        commonMistakes: parseLines(formData.commonMistakes),
        tips: formData.tips || undefined,
        prerequisites: formData.prerequisites || undefined,
        relatedConcepts: formData.relatedConcepts || undefined
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-blue-500 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <CardHeader className="border-b border-blue-700 bg-blue-950/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-blue-100">Thêm Khái niệm mới</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-blue-200 hover:text-blue-100 hover:bg-blue-800">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-blue-200 font-semibold">Tên khái niệm *</Label>
            <Input
              required
              placeholder="VD: Công thức nghiệm phương trình bậc 2"
              value={formData.conceptName}
              onChange={(e) => setFormData({ ...formData, conceptName: e.target.value })}
              className="mt-1 bg-gray-800 border-blue-700 text-gray-100 placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          <div>
            <MathTextInput
              label="Định nghĩa *"
              value={formData.definition}
              onChange={(value) => setFormData({ ...formData, definition: value })}
              placeholder="VD: Phương trình $ax^2 + bx + c = 0$ với $a \neq 0$..."
              rows={4}
            />
          </div>

          <div>
            <MathTextInput
              label="Giải thích chi tiết"
              value={formData.explanation}
              onChange={(value) => setFormData({ ...formData, explanation: value })}
              placeholder="Giải thích chi tiết về khái niệm..."
              rows={5}
            />
          </div>

          <div>
            <MathTextInput
              label="Điểm chính (mỗi dòng là một điểm)"
              value={formData.keyPoints}
              onChange={(value) => setFormData({ ...formData, keyPoints: value })}
              placeholder="Điểm 1: Delta quyết định số nghiệm\nĐiểm 2: Công thức nghiệm phụ thuộc delta"
              rows={3}
            />
          </div>

          <div>
            <MathTextInput
              label="Ví dụ minh họa (mỗi dòng là một ví dụ)"
              value={formData.examples}
              onChange={(value) => setFormData({ ...formData, examples: value })}
              placeholder="VD 1: Giải $x^2 - 5x + 6 = 0$\nVD 2: Giải $x^2 + 4x + 4 = 0$"
              rows={4}
            />
          </div>

          <div>
            <MathTextInput
              label="Sai lầm thường gặp (mỗi dòng là một sai lầm)"
              value={formData.commonMistakes}
              onChange={(value) => setFormData({ ...formData, commonMistakes: value })}
              placeholder="Sai lầm 1: Quên kiểm tra điều kiện a ≠ 0\nSai lầm 2: Nhầm công thức tính delta"
              rows={3}
            />
          </div>

          <div>
            <MathTextInput
              label="Mẹo & Gợi ý"
              value={formData.tips}
              onChange={(value) => setFormData({ ...formData, tips: value })}
              placeholder="Luôn kiểm tra điều kiện trước khi giải..."
              rows={2}
            />
          </div>

          <div>
            <Label className="text-blue-200 font-semibold">Kiến thức cần có</Label>
            <Input
              value={formData.prerequisites}
              onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
              placeholder="VD: Phương trình bậc nhất, căn thức"
              className="mt-1 bg-gray-800 border-blue-700 text-gray-100 placeholder:text-gray-500"
            />
          </div>

          <div>
            <Label className="text-blue-200 font-semibold">Khái niệm liên quan</Label>
            <Input
              value={formData.relatedConcepts}
              onChange={(e) => setFormData({ ...formData, relatedConcepts: e.target.value })}
              placeholder="VD: Định lý Viète, hệ số bậc 2"
              className="mt-1 bg-gray-800 border-blue-700 text-gray-100 placeholder:text-gray-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Lưu khái niệm
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="border-blue-600 text-blue-200 hover:bg-blue-900">
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface FormulaFormProps {
  nodeId: number;
  onSubmit: (data: FormulaRequest) => Promise<void>;
  onCancel: () => void;
}

export function FormulaForm({ nodeId, onSubmit, onCancel }: FormulaFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nodeId,
    formulaName: '',
    formulaText: '',
    formulaLatex: '',
    variables: '',
    conditions: '',
    isPrimary: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Parse variables string to object
      const variablesObj: Record<string, string> = {};
      if (formData.variables) {
        const lines = formData.variables.split('\n');
        lines.forEach(line => {
          const parts = line.split('=');
          if (parts.length === 2) {
            const key = parts[0].trim();
            const value = parts[1].trim();
            if (key) {
              variablesObj[key] = value;
            }
          }
        });
      }

      await onSubmit({
        nodeId: formData.nodeId,
        formulaName: formData.formulaName,
        formulaText: formData.formulaText,
        formulaLatex: formData.formulaLatex,
        variables: variablesObj,
        conditions: formData.conditions,
        isPrimary: formData.isPrimary
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-cyan-500 bg-gradient-to-br from-gray-900 via-cyan-900 to-gray-900">
      <CardHeader className="border-b border-cyan-700 bg-cyan-950/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-cyan-100">Thêm Công thức mới</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-cyan-200 hover:text-cyan-100 hover:bg-cyan-800">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-cyan-200 font-semibold">Tên công thức *</Label>
            <Input
              required
              placeholder="VD: Công thức nghiệm phương trình bậc 2"
              value={formData.formulaName}
              onChange={(e) => setFormData({ ...formData, formulaName: e.target.value })}
              className="mt-1 bg-gray-800 border-cyan-700 text-gray-100 placeholder:text-gray-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <MathTextInput
              label="Công thức (dạng text) *"
              value={formData.formulaText}
              onChange={(value) => setFormData({ ...formData, formulaText: value })}
              placeholder="VD: x = (-b ± √(b² - 4ac)) / 2a"
              rows={2}
            />
          </div>

          <div>
            <Label className="text-cyan-900 font-semibold">LaTeX (tùy chọn)</Label>
            <Input
              placeholder="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
              value={formData.formulaLatex}
              onChange={(e) => setFormData({ ...formData, formulaLatex: e.target.value })}
              className="mt-1 bg-white border-cyan-200 font-mono text-sm"
            />
          </div>

          <div>
            <MathTextInput
              label="Biến số (mỗi dòng: biến = ý nghĩa)"
              value={formData.variables}
              onChange={(value) => setFormData({ ...formData, variables: value })}
              placeholder="a = hệ số bậc 2&#10;b = hệ số bậc 1&#10;c = hệ số tự do"
              rows={3}
            />
          </div>

          <div>
            <MathTextInput
              label="Điều kiện"
              value={formData.conditions}
              onChange={(value) => setFormData({ ...formData, conditions: value })}
              placeholder="VD: a ≠ 0, Δ = b² - 4ac ≥ 0"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPrimary"
              checked={formData.isPrimary}
              onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked as boolean })}
              className="border-cyan-500 data-[state=checked]:bg-cyan-600"
            />
            <Label htmlFor="isPrimary" className="text-sm text-cyan-200 cursor-pointer">
              Đây là công thức chính
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Lưu công thức
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="border-cyan-600 text-cyan-200 hover:bg-cyan-900">
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface ExerciseFormProps {
  nodeId: number;
  onSubmit: (data: ExerciseRequest) => Promise<void>;
  onCancel: () => void;
}

export function ExerciseForm({ nodeId, onSubmit, onCancel }: ExerciseFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nodeId,
    question: '',
    solution: '',
    difficultyLevel: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD',
    cognitiveLevel: 'COMPREHENSION' as 'RECOGNITION' | 'COMPREHENSION' | 'APPLICATION' | 'ADVANCED_APPLICATION',
    hints: '',
    estimatedTime: undefined as number | undefined,
    points: undefined as number | undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Parse hints string to array
      const hintsArray = formData.hints
        ? formData.hints.split('\n').filter(h => h.trim())
        : undefined;

      await onSubmit({
        nodeId: formData.nodeId,
        question: formData.question,
        solution: formData.solution || undefined,
        hints: hintsArray,
        difficultyLevel: formData.difficultyLevel,
        cognitiveLevel: formData.cognitiveLevel,
        estimatedTime: formData.estimatedTime,
        points: formData.points
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-pink-500 bg-gradient-to-br from-gray-900 via-pink-900 to-gray-900">
      <CardHeader className="border-b border-pink-700 bg-pink-950/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-pink-100">Thêm Bài tập mới</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-pink-200 hover:text-pink-100 hover:bg-pink-800">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <MathTextInput
              label="Câu hỏi *"
              value={formData.question}
              onChange={(value) => setFormData({ ...formData, question: value })}
              placeholder="VD: Giải phương trình $x^2 - 5x + 6 = 0$"
              rows={3}
            />
          </div>

          <div>
            <MathTextInput
              label="Lời giải chi tiết"
              value={formData.solution}
              onChange={(value) => setFormData({ ...formData, solution: value })}
              placeholder="Giải thích từng bước..."
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-pink-200 font-semibold">Độ khó</Label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value as 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD' })}
              >
                <SelectTrigger className="mt-1 bg-gray-800 border-pink-700 text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-pink-700">
                  <SelectItem value="EASY" className="text-gray-100">Dễ</SelectItem>
                  <SelectItem value="MEDIUM" className="text-gray-100">Trung bình</SelectItem>
                  <SelectItem value="HARD" className="text-gray-100">Khó</SelectItem>
                  <SelectItem value="VERY_HARD" className="text-gray-100">Rất khó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-pink-200 font-semibold">Mức độ tư duy</Label>
              <Select
                value={formData.cognitiveLevel}
                onValueChange={(value) => setFormData({ ...formData, cognitiveLevel: value as 'RECOGNITION' | 'COMPREHENSION' | 'APPLICATION' | 'ADVANCED_APPLICATION' })}
              >
                <SelectTrigger className="mt-1 bg-gray-800 border-pink-700 text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-pink-700">
                  <SelectItem value="RECOGNITION" className="text-gray-100">Nhận biết</SelectItem>
                  <SelectItem value="COMPREHENSION" className="text-gray-100">Thông hiểu</SelectItem>
                  <SelectItem value="APPLICATION" className="text-gray-100">Vận dụng</SelectItem>
                  <SelectItem value="ADVANCED_APPLICATION" className="text-gray-100">Vận dụng cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <MathTextInput
              label="Gợi ý (mỗi dòng là một gợi ý)"
              value={formData.hints}
              onChange={(value) => setFormData({ ...formData, hints: value })}
              placeholder="Gợi ý 1: Tìm delta\nGợi ý 2: Áp dụng công thức nghiệm"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedTime" className="text-pink-200 font-semibold">
                Thời gian dự kiến (phút)
              </Label>
              <Input
                id="estimatedTime"
                type="number"
                min="1"
                value={formData.estimatedTime || ''}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="VD: 10"
                className="mt-1 bg-gray-800 border-pink-700 text-gray-100 placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="points" className="text-pink-200 font-semibold">
                Điểm số
              </Label>
              <Input
                id="points"
                type="number"
                min="0"
                step="0.5"
                value={formData.points || ''}
                onChange={(e) => setFormData({ ...formData, points: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="VD: 2.5"
                className="mt-1 bg-gray-800 border-pink-700 text-gray-100 placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Lưu bài tập
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="border-pink-600 text-pink-200 hover:bg-pink-900">
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
