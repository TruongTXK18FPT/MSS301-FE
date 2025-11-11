'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, Target, Sparkles, Trophy, Clock } from "lucide-react";
import Link from 'next/link';

export default function PracticePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="stars absolute inset-0"></div>
        <div className="twinkling absolute inset-0"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse">
              <Brain className="size-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-4">
            Luyện Tập Toán Học
          </h1>
          <p className="text-xl text-purple-200/80 max-w-3xl mx-auto">
            Nâng cao kỹ năng toán học của bạn với hệ thống quiz thông minh được hỗ trợ bởi AI
          </p>
        </div>

        {/* Main Quiz Card */}
        <Card className="max-w-4xl mx-auto bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-3xl overflow-hidden mb-12">
          <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl text-white mb-2">
              Hệ Thống Quiz Tương Tác
            </CardTitle>
            <CardDescription className="text-lg text-purple-200">
              Học toán hiệu quả hơn với AI làm trợ lý cá nhân
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pb-8">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-purple-500/10 rounded-2xl border border-purple-400/20 hover:border-purple-400/50 transition-all hover:scale-105">
                <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4">
                  <BookOpen className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">Đa dạng chủ đề</h3>
                <p className="text-sm text-purple-200">
                  Đại số, Hình học, Xác suất, Giải tích và nhiều hơn nữa
                </p>
              </div>

              <div className="p-6 bg-pink-500/10 rounded-2xl border border-pink-400/20 hover:border-pink-400/50 transition-all hover:scale-105">
                <div className="p-3 bg-pink-500/20 rounded-xl w-fit mb-4">
                  <Brain className="h-8 w-8 text-pink-400" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">AI Thông Minh</h3>
                <p className="text-sm text-pink-200">
                  Nhận gợi ý và giải thích chi tiết cho từng câu hỏi
                </p>
              </div>

              <div className="p-6 bg-cyan-500/10 rounded-2xl border border-cyan-400/20 hover:border-cyan-400/50 transition-all hover:scale-105">
                <div className="p-3 bg-cyan-500/20 rounded-xl w-fit mb-4">
                  <Target className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">Theo dõi tiến độ</h3>
                <p className="text-sm text-cyan-200">
                  Xem kết quả, thống kê và cải thiện liên tục
                </p>
              </div>
            </div>

            {/* Additional Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Sparkles className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Câu hỏi AI</h4>
                  <p className="text-sm text-purple-200">
                    Admin có thể tạo câu hỏi tự động bằng AI
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Giới hạn thời gian</h4>
                  <p className="text-sm text-purple-200">
                    Luyện tập với áp lực thời gian như thi thật
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Trophy className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Xếp hạng</h4>
                  <p className="text-sm text-purple-200">
                    So sánh kết quả với các bạn học khác
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Nhiều dạng câu</h4>
                  <p className="text-sm text-purple-200">
                    Trắc nghiệm, đúng/sai, tự luận
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link href="/practice/quizzes">
                <Button className="w-full h-16 text-lg bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all hover:scale-105">
                  <BookOpen className="h-6 w-6 mr-3" />
                  Bắt Đầu Luyện Tập Ngay
                  <Sparkles className="h-6 w-6 ml-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: 'Quiz có sẵn', value: '50+', icon: BookOpen, color: 'purple' },
            { label: 'Câu hỏi', value: '500+', icon: Brain, color: 'pink' },
            { label: 'Chủ đề', value: '10+', icon: Target, color: 'cyan' },
            { label: 'AI hỗ trợ', value: '24/7', icon: Sparkles, color: 'green' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="bg-black/40 backdrop-blur-xl border border-purple-500/30 text-center p-4 hover:scale-105 transition-all">
                <Icon className={`h-8 w-8 text-${stat.color}-400 mx-auto mb-2`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-purple-200">{stat.label}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

