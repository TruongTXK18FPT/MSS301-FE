'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Search, Edit, Trash2, Eye, 
  BookOpen, Clock, Award, Users,
  Target, Sparkles
} from 'lucide-react';
import { contentService, ContentItem, Quiz } from '@/lib/services/content.service';
import QuizForm from '@/components/admin/QuizForm';

export default function AdminQuizManagement() {
  const [quizzes, setQuizzes] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<ContentItem | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      // Admin loads their own quizzes (not limited to public)
      const items = await contentService.getContentItems({ type: 'QUIZ' });
      setQuizzes(items);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      alert('Không thể tải danh sách quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa quiz này?')) return;

    try {
      await contentService.deleteContentItem(id);
      await loadQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Xóa quiz thất bại');
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setEditingQuiz(null);
    loadQuizzes();
  };

  const grades = ['all', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || quiz.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Quản lý Quiz</h1>
              <p className="text-purple-200">Tạo và quản lý các bài quiz cho học sinh</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
              <Input
                placeholder="Tìm kiếm quiz..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-black/30 border-purple-400/30 text-white placeholder:text-purple-200/50"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {grades.map((grade) => (
              <Button
                key={grade}
                size="sm"
                variant={selectedGrade === grade ? 'default' : 'outline'}
                onClick={() => setSelectedGrade(grade)}
                className={selectedGrade === grade 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-black/30 border-purple-400/30 text-purple-200'
                }
              >
                {grade === 'all' ? 'Tất cả' : `Lớp ${grade}`}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo quiz mới
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/40 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <BookOpen className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-purple-200">Tổng quiz</p>
                  <p className="text-2xl font-bold text-white">{quizzes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-cyan-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-cyan-500/20">
                  <Users className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-cyan-200">Công khai</p>
                  <p className="text-2xl font-bold text-white">
                    {quizzes.filter(q => q.isPublic).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-pink-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-pink-500/20">
                  <Target className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-pink-200">Môn Toán</p>
                  <p className="text-2xl font-bold text-white">
                    {quizzes.filter(q => q.subject === 'Toán học').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Sparkles className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-green-200">Có AI</p>
                  <p className="text-2xl font-bold text-white">{quizzes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <Card className="bg-black/40 border-purple-500/30">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'Không tìm thấy quiz nào' : 'Chưa có quiz nào'}
              </h3>
              <p className="text-purple-200 mb-6">
                Tạo quiz đầu tiên để học sinh luyện tập
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo quiz mới
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="bg-black/40 border-purple-500/30 hover:border-pink-500/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white mb-2">{quiz.title}</CardTitle>
                      <CardDescription className="text-purple-200">
                        {quiz.description || 'Không có mô tả'}
                      </CardDescription>
                    </div>
                    <Badge className={quiz.isPublic ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}>
                      {quiz.isPublic ? 'Công khai' : 'Riêng tư'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-purple-200">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>Lớp {quiz.grade}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{quiz.subject}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingQuiz(quiz)}
                      className="flex-1 bg-cyan-500/20 border-cyan-400/30 text-cyan-300"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="bg-red-500/20 border-red-400/30 text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {quiz.tags && quiz.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {quiz.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-purple-400/30 text-purple-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingQuiz) && (
        <QuizForm
          quiz={editingQuiz}
          onSuccess={handleCreateSuccess}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingQuiz(null);
          }}
        />
      )}
    </div>
  );
}
