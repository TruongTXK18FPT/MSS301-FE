'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Loader2, 
  X, 
  AlertCircle, 
  CheckCircle,
  Calculator
} from 'lucide-react';
import mindmapService from '@/lib/services/mindmapService';
import type { FormulaResponse } from '@/lib/dto';

interface FormulaGeneratorFormProps {
  nodeId: number;
  nodeName: string;
  onSuccess?: (formulas: FormulaResponse[]) => void;
  onClose: () => void;
}

export default function FormulaGeneratorForm({ 
  nodeId, 
  nodeName, 
  onSuccess, 
  onClose 
}: FormulaGeneratorFormProps) {
  const [formData, setFormData] = useState({
    topic: nodeName,
    numberOfFormulas: 2
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
      const formulas = await mindmapService.generateFormulas({
        nodeId,
        topic: formData.topic,
        numberOfFormulas: formData.numberOfFormulas
      });

      setSuccess(`Đã tạo ${formulas.length} công thức thành công!`);
      
      if (onSuccess) {
        onSuccess(formulas);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Tạo công thức thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl shadow-2xl border-2 border-cyan-500/30">
        <CardHeader className="bg-gradient-to-r from-cyan-600 via-cyan-700 to-blue-600 text-white pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Tạo công thức với AI</CardTitle>
                <p className="text-cyan-100 text-sm mt-1">Node: {nodeName}</p>
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
                Chủ đề công thức <span className="text-red-500">*</span>
              </Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Ví dụ: Công thức nghiệm phương trình bậc hai"
                required
              />
              <p className="text-sm text-gray-500">
                AI sẽ tạo công thức với LaTeX, giải thích biến số và ví dụ áp dụng
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfFormulas">
                Số lượng công thức <span className="text-red-500">*</span>
              </Label>
              <Input
                id="numberOfFormulas"
                type="number"
                min="1"
                max="5"
                value={formData.numberOfFormulas}
                onChange={(e) => setFormData({ ...formData, numberOfFormulas: parseInt(e.target.value) })}
                required
              />
              <p className="text-sm text-gray-500">
                Đề xuất: 1-3 công thức cho mỗi node
              </p>
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
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang tạo với AI...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-5 w-5" />
                    Tạo công thức
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
