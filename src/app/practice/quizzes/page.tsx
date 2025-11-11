'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, BookOpen, Clock, Award, Target,
  Play, Sparkles, Brain, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { contentService, ContentItem } from '@/lib/services/content.service';
import QuizPlayer from '@/components/practice/QuizPlayer';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedQuiz, setSelectedQuiz] = useState<ContentItem | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const items = await contentService.getContentItems({ 
        type: 'QUIZ',
        isPublic: true 
      });
      setQuizzes(items);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const grades = ['all', '6', '7', '8', '9', '10', '11', '12'];

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || quiz.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  if (selectedQuiz) {
    return (
      <QuizPlayer
        quiz={selectedQuiz}
        onClose={() => setSelectedQuiz(null)}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Back Button */}
        <Link href="/practice">
          <Button variant="outline" className="mb-6 bg-black/30 border-purple-400/30 text-purple-200">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse">
              <Brain className="size-12 text-white animate-bounce" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-4">
            Luyện Tập Quiz
          </h1>
          <p className="text-lg text-purple-200/80 max-w-2xl mx-auto">
            Rèn luyện kỹ năng toán học qua các bài quiz thú vị với hỗ trợ AI thông minh
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <BookOpen className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-purple-200">Tổng Quiz</p>
                  <p className="text-2xl font-bold text-white">{quizzes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-cyan-500/20">
                  <Target className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-cyan-200">Môn Toán</p>
                  <p className="text-2xl font-bold text-white">
                    {quizzes.filter(q => q.subject === 'Toán học').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-pink-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-pink-500/20">
                  <Award className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-pink-200">Điểm TB</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Sparkles className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-green-200">Hỗ trợ AI</p>
                  <p className="text-2xl font-bold text-white">✓</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
              <Input
                placeholder="Tìm kiếm quiz..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-black/30 border-purple-400/30 text-white placeholder:text-purple-200/50 rounded-xl backdrop-blur-sm"
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
                className={`rounded-xl ${
                  selectedGrade === grade
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-black/30 border-purple-400/30 text-purple-200'
                }`}
              >
                {grade === 'all' ? 'Tất cả' : `Lớp ${grade}`}
              </Button>
            ))}
          </div>
        </div>

        {/* Quiz List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'Không tìm thấy quiz nào' : 'Chưa có quiz nào'}
              </h3>
              <p className="text-purple-200">
                Vui lòng quay lại sau hoặc thử tìm kiếm khác
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="bg-black/40 backdrop-blur-xl border border-pink-500/30 rounded-2xl hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 hover:scale-105 group">
                <div className="h-2 bg-gradient-to-r from-pink-500 to-violet-500"></div>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                      Lớp {quiz.grade}
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI
                    </Badge>
                  </div>
                  <CardTitle className="text-white group-hover:text-pink-200 transition-colors">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    {quiz.description || 'Không có mô tả'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-purple-200">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{quiz.subject}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>30 phút</span>
                    </div>
                  </div>

                  {quiz.tags && quiz.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {quiz.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-purple-400/30 text-purple-300">
                          {tag}
                        </Badge>
                      ))}
                      {quiz.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-300">
                          +{quiz.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => setSelectedQuiz(quiz)}
                    className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Bắt đầu làm bài
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
