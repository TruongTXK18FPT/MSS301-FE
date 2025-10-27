'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Calculator, 
  FileQuestion, 
  Plus, 
  Edit2, 
  Trash2, 
  Lightbulb,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { mindmapService } from '@/lib/services/mindmapService';
import { 
  ExerciseResponse, 
  FormulaResponse, 
  ConceptResponse 
} from '@/lib/dto/mindmap';

interface NodeDetailViewProps {
  nodeId: string;
  nodeName: string;
  onClose: () => void;
}

export default function NodeDetailView({ nodeId, nodeName, onClose }: NodeDetailViewProps) {
  const [activeTab, setActiveTab] = useState('concepts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [concepts, setConcepts] = useState<ConceptResponse[]>([]);
  const [formulas, setFormulas] = useState<FormulaResponse[]>([]);
  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);

  useEffect(() => {
    loadNodeData();
  }, [nodeId]);

  const loadNodeData = async () => {
    setLoading(true);
    setError('');
    try {
      const nodeIdNum = parseInt(nodeId);
      
      // Check if nodeId is valid
      if (isNaN(nodeIdNum) || nodeIdNum <= 0) {
        console.warn('Invalid node ID:', nodeId);
        setConcepts([]);
        setFormulas([]);
        setExercises([]);
        return;
      }
      
      // Load data with individual error handling
      const [conceptsData, formulasData, exercisesData] = await Promise.allSettled([
        mindmapService.getConceptsByNode(nodeIdNum),
        mindmapService.getFormulasByNode(nodeIdNum),
        mindmapService.getExercisesByNode(nodeIdNum)
      ]);
      
      setConcepts(conceptsData.status === 'fulfilled' ? conceptsData.value : []);
      setFormulas(formulasData.status === 'fulfilled' ? formulasData.value : []);
      setExercises(exercisesData.status === 'fulfilled' ? exercisesData.value : []);
      
      // Log errors but don't fail entirely
      if (conceptsData.status === 'rejected') {
        console.warn('Failed to load concepts:', conceptsData.reason);
      }
      if (formulasData.status === 'rejected') {
        console.warn('Failed to load formulas:', formulasData.reason);
      }
      if (exercisesData.status === 'rejected') {
        console.warn('Failed to load exercises:', exercisesData.reason);
      }
    } catch (err: any) {
      console.error('Error loading node data:', err);
      setError(err.message);
      setConcepts([]);
      setFormulas([]);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'EASY': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HARD': return 'bg-orange-500';
      case 'VERY_HARD': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'EASY': return 'Dễ';
      case 'MEDIUM': return 'Trung bình';
      case 'HARD': return 'Khó';
      case 'VERY_HARD': return 'Rất khó';
      default: return level;
    }
  };

  const getCognitiveLabel = (level: string) => {
    switch (level) {
      case 'RECOGNITION': return 'Nhận biết';
      case 'COMPREHENSION': return 'Thông hiểu';
      case 'APPLICATION': return 'Vận dụng';
      case 'ADVANCED_APPLICATION': return 'Vận dụng cao';
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <CardContent className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-purple-500/30">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{nodeName}</CardTitle>
              <p className="text-purple-100 text-sm mt-1">Chi tiết nội dung node</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="concepts" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Khái niệm ({concepts.length})
              </TabsTrigger>
              <TabsTrigger value="formulas" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Công thức ({formulas.length})
              </TabsTrigger>
              <TabsTrigger value="exercises" className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4" />
                Bài tập ({exercises.length})
              </TabsTrigger>
            </TabsList>

            {/* Concepts Tab */}
            <TabsContent value="concepts" className="space-y-4">
              {concepts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-semibold mb-2">Chưa có khái niệm nào</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Thêm khái niệm, định nghĩa, và giải thích cho node này
                  </p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      alert('Tính năng thêm khái niệm thủ công sẽ được phát triển. Hiện tại hãy dùng "Tạo bài tập AI" để tự động tạo nội dung.');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm khái niệm
                  </Button>
                </div>
              ) : (
                concepts.map((concept) => (
                  <Card key={concept.id} className="border-2 border-purple-200 hover:border-purple-400 transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                        {concept.conceptName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Định nghĩa:</h4>
                        <p className="text-sm text-gray-600">{concept.definition}</p>
                      </div>
                      
                      {concept.explanation && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Giải thích:</h4>
                          <p className="text-sm text-gray-600">{concept.explanation}</p>
                        </div>
                      )}

                      {concept.keyPoints && concept.keyPoints.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Điểm chính:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {concept.keyPoints.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {concept.examples && concept.examples.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Ví dụ:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {concept.examples.map((example, idx) => (
                              <li key={idx}>{example}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {concept.tips && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-sm text-yellow-900 mb-1">Mẹo:</h4>
                              <p className="text-sm text-yellow-800">{concept.tips}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Formulas Tab */}
            <TabsContent value="formulas" className="space-y-4">
              {formulas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-semibold mb-2">Chưa có công thức nào</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Thêm công thức toán học liên quan đến node này
                  </p>
                  <Button 
                    className="bg-cyan-600 hover:bg-cyan-700"
                    onClick={() => {
                      alert('Tính năng thêm công thức thủ công sẽ được phát triển. Hiện tại hãy dùng "Tạo bài tập AI" để tự động tạo nội dung.');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm công thức
                  </Button>
                </div>
              ) : (
                formulas.map((formula) => (
                  <Card key={formula.id} className="border-2 border-cyan-200 hover:border-cyan-400 transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-cyan-600" />
                        {formula.formulaName}
                        {formula.isPrimary && (
                          <Badge className="bg-cyan-500">Chính</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-4 font-mono text-center">
                        {formula.formulaLatex || formula.formulaText}
                      </div>

                      {formula.variables && Object.keys(formula.variables).length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Biến số:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(formula.variables).map(([key, value]) => (
                              <div key={key} className="bg-blue-50 rounded p-2">
                                <span className="font-mono font-semibold">{key}</span>
                                <span className="text-gray-600 text-sm ml-2">= {value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {formula.conditions && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Điều kiện:</h4>
                          <p className="text-sm text-gray-600">{formula.conditions}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Exercises Tab */}
            <TabsContent value="exercises" className="space-y-4">
              {exercises.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileQuestion className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-semibold mb-2">Chưa có bài tập nào</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Sử dụng AI để tạo bài tập hoặc thêm thủ công
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
                      onClick={onClose}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Đóng & Dùng AI
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        alert('Tính năng thêm bài tập thủ công sẽ được phát triển.');
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm thủ công
                    </Button>
                  </div>
                </div>
              ) : (
                exercises.map((exercise, index) => (
                  <Card key={exercise.id} className="border-2 border-pink-200 hover:border-pink-400 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileQuestion className="h-5 w-5 text-pink-600" />
                          Bài tập {index + 1}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge className={getDifficultyColor(exercise.difficultyLevel)}>
                            {getDifficultyLabel(exercise.difficultyLevel)}
                          </Badge>
                          <Badge variant="outline">
                            {getCognitiveLabel(exercise.cognitiveLevel)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Câu hỏi:</h4>
                        <p className="text-sm text-gray-600">{exercise.question}</p>
                      </div>

                      {exercise.hints && exercise.hints.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Gợi ý:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {exercise.hints.map((hint, idx) => (
                              <li key={idx}>{hint}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {exercise.solution && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <h4 className="font-semibold text-sm text-green-900 mb-1">Lời giải:</h4>
                          <p className="text-sm text-green-800">{exercise.solution}</p>
                        </div>
                      )}

                      {exercise.estimatedTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">Thời gian ước tính:</span>
                          <span>{exercise.estimatedTime} phút</span>
                        </div>
                      )}

                      {exercise.points && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">Điểm:</span>
                          <span>{exercise.points}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
