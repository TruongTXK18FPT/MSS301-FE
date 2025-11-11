'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles, Loader2 } from 'lucide-react';

interface AiQuizGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (topic: string, grade: string, numQuestions: number) => Promise<void>;
}

export default function AiQuizGeneratorModal({
  open,
  onClose,
  onGenerate,
}: AiQuizGeneratorModalProps) {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic || !grade || numQuestions < 1 || numQuestions > 20) {
      alert('Vui lòng nhập đầy đủ thông tin hợp lệ');
      return;
    }

    try {
      setGenerating(true);
      await onGenerate(topic, grade, numQuestions);
      // Reset form
      setTopic('');
      setGrade('');
      setNumQuestions(5);
      onClose();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi tạo câu hỏi');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Tạo Quiz Bằng AI
          </DialogTitle>
          <DialogDescription className="text-purple-200">
            Nhập thông tin để AI tạo câu hỏi quiz tự động
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-purple-200">
              Chủ đề <span className="text-red-400">*</span>
            </Label>
            <Input
              id="topic"
              placeholder="VD: Phương trình bậc 2"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-black/40 border-purple-500/30 text-white placeholder:text-purple-300/50"
              disabled={generating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade" className="text-purple-200">
              Lớp <span className="text-red-400">*</span>
            </Label>
            <Input
              id="grade"
              placeholder="VD: 9"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="bg-black/40 border-purple-500/30 text-white placeholder:text-purple-300/50"
              disabled={generating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numQuestions" className="text-purple-200">
              Số câu hỏi <span className="text-red-400">*</span>
            </Label>
            <Input
              id="numQuestions"
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value) || 1)}
              className="bg-black/40 border-purple-500/30 text-white"
              disabled={generating}
            />
            <p className="text-xs text-purple-300/70">Tối thiểu 1, tối đa 20 câu</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={generating}
            className="border-purple-500/30 text-purple-300"
          >
            Hủy
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generating || !topic || !grade}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Tạo câu hỏi
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
