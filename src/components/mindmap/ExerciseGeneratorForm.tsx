'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, 
  Loader2, 
  X, 
  AlertCircle, 
  CheckCircle,
  FileQuestion 
} from 'lucide-react';
import { mindmapService } from '@/lib/services/mindmapService';
import { ExerciseResponse } from '@/lib/dto/mindmap';

interface ExerciseGeneratorFormProps {
  nodeId: number;
  nodeName: string;
  onSuccess?: (exercises: ExerciseResponse[]) => void;
  onClose: () => void;
}

export default function ExerciseGeneratorForm({ 
  nodeId, 
  nodeName, 
  onSuccess, 
  onClose 
}: ExerciseGeneratorFormProps) {
  const [formData, setFormData] = useState({
    topic: nodeName,
    difficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD',
    cognitiveLevel: 'COMPREHENSION' as 'RECOGNITION' | 'COMPREHENSION' | 'APPLICATION' | 'ADVANCED_APPLICATION',
    numberOfExercises: 3
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const exercises = await mindmapService.generateExercises({
        nodeId,
        topic: formData.topic,
        difficulty: formData.difficulty,
        cognitiveLevel: formData.cognitiveLevel,
        numberOfExercises: formData.numberOfExercises
      });

      setSuccess(`Đã tạo ${exercises.length} bài tập thành công!`);
      
      if (onSuccess) {
        onSuccess(exercises);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Tạo bài tập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl shadow-2xl border-2 border-pink-500/30">
        <CardHeader className="bg-gradient-to-r from-pink-600 via-pink-700 to-purple-600 text-white pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Tạo bài tập với AI</CardTitle>
                <p className="text-pink-100 text-sm mt-1">Node: {nodeName}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={loading}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="topic">
                Chủ đề bài tập <span className="text-red-500">*</span>
              </Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Ví dụ: Phương trình bậc hai"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">
                  Độ khó <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Dễ</SelectItem>
                    <SelectItem value="MEDIUM">Trung bình</SelectItem>
                    <SelectItem value="HARD">Khó</SelectItem>
                    <SelectItem value="VERY_HARD">Rất khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfExercises">
                  Số lượng bài tập <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numberOfExercises"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.numberOfExercises}
                  onChange={(e) => setFormData({ ...formData, numberOfExercises: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cognitiveLevel">
                Mức độ nhận thức <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.cognitiveLevel} 
                onValueChange={(value: any) => setFormData({ ...formData, cognitiveLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECOGNITION">Nhận biết</SelectItem>
                  <SelectItem value="COMPREHENSION">Thông hiểu</SelectItem>
                  <SelectItem value="APPLICATION">Vận dụng</SelectItem>
                  <SelectItem value="ADVANCED_APPLICATION">Vận dụng cao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang tạo với AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Tạo bài tập
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
