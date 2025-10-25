"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Bot, BrainCircuit, BookOpen, Presentation, Star, Rocket, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import ClientOnlyWrapper from '@/components/client-only-wrapper';
import { useState, useEffect } from 'react';
import { isAdmin } from '@/lib/role-utils';

const benefits = [
  {
    icon: <BrainCircuit className="size-8 text-accent" />,
    title: 'MindMap Trực Quan',
    description: 'Hệ thống hoá kiến thức một cách logic và sáng tạo.',
    gradient: 'from-purple-500 to-pink-500',
    glow: 'shadow-purple-500/25',
  },
  {
    icon: <Bot className="size-8 text-teal" />,
    title: 'Bài Tập AI',
    description: 'Luyện tập không giới hạn với các bài toán được AI tạo ra.',
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'shadow-cyan-500/25',
  },
  {
    icon: <BookOpen className="size-8 text-neon-blue" />,
    title: 'Giải Thích Thông Minh',
    description: 'Nhận gợi ý và giải thích chi tiết từ trợ lý AI.',
    gradient: 'from-blue-500 to-indigo-500',
    glow: 'shadow-blue-500/25',
  },
  {
    icon: <Presentation className="size-8 text-gold" />,
    title: 'Dashboard Lớp Học',
    description: 'Theo dõi tiến độ, quản lý bài tập và tương tác với giáo viên.',
    gradient: 'from-yellow-500 to-orange-500',
    glow: 'shadow-yellow-500/25',
  },
];

const features = [
  {
    title: 'Khám Phá Vũ Trụ Toán Học',
    description: 'Hành trình khám phá không gian tri thức vô tận',
    background: '/background1.jpg',
    icon: <Rocket className="size-12 text-yellow-400" />,
  },
  {
    title: 'Trí Tuệ Nhân Tạo Thông Minh',
    description: 'AI đồng hành trong mọi bước học tập',
    background: '/background2.jpg',
    icon: <Zap className="size-12 text-blue-400" />,
  },
  {
    title: 'Cộng Đồng Học Tập Sôi Động',
    description: 'Kết nối và chia sẻ kiến thức cùng bạn bè',
    background: '/background3.jpg',
    icon: <Sparkles className="size-12 text-purple-400" />,
  },
];

export default function Home() {
  const { profileCompleted, role, roleId } = useAuth();
  const [floatingStars, setFloatingStars] = useState<Array<{left: string, top: string, animationDelay: string, animationDuration: string}>>([]);

  useEffect(() => {
    // Generate floating stars
    const stars = Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${3 + Math.random() * 4}s`
    }));
    setFloatingStars(stars);
  }, []);

  return (
    <ClientOnlyWrapper>
      <div className="relative min-h-screen overflow-hidden">
        {/* Floating Stars Background */}
        <div className="absolute inset-0 z-0">
          {floatingStars.map((star, i) => (
            <div
              key={`star-${i}-${star.left}-${star.top}`}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-float"
              style={{
                left: star.left,
                top: star.top,
                animationDelay: star.animationDelay,
                animationDuration: star.animationDuration
              }}
            />
          ))}
        </div>

        {/* Hero Section */}
        <section className="relative z-10 container mx-auto px-4 py-20 sm:py-32 text-center">

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-200 text-sm font-medium mb-6">
              <Sparkles className="size-4" />
              <span>Khám phá vũ trụ tri thức</span>
            </div>
          </div>

          <h1 className="font-headline text-5xl font-bold tracking-tight text-ink-white sm:text-6xl md:text-7xl mb-6">
            Khám phá vũ trụ{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet via-pink to-teal animate-gradient">
              Toán học
            </span>
            <br />
            <span className="text-4xl sm:text-5xl md:text-6xl">của bạn 🚀</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-xl text-ink-secondary md:text-2xl leading-relaxed">
            MathMind biến mọi khái niệm phức tạp thành những hành trình khám phá đầy thú vị. 
            Sẵn sàng để chinh phục các vì sao tri thức?
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/mindmap">
              <Button size="lg" className="group rounded-2xl bg-gradient-to-r from-violet to-teal px-10 py-6 text-xl font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.6)]">
                <BrainCircuit className="mr-3 size-6 group-hover:rotate-12 transition-transform" />
                Khám phá MindMap
                <ArrowRight className="ml-3 size-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="lg" variant="ghost" className="group rounded-2xl px-10 py-6 text-xl font-bold text-ink-secondary transition-all duration-300 hover:text-white hover:bg-white/10">
                <Bot className="mr-3 size-6 group-hover:scale-110 transition-transform" />
                Trò chuyện với AI
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section with Background Images */}
        <section className="relative z-10 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl font-bold tracking-tight text-ink-white sm:text-5xl mb-6">
                Hành Trình Khám Phá
              </h2>
              <p className="text-xl text-ink-secondary max-w-3xl mx-auto">
                Từng bước chinh phục vũ trụ tri thức với những công cụ mạnh mẽ nhất
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={`feature-${feature.title}-${index}`}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                       style={{ backgroundImage: `url(${feature.background})` }} />
                  <div className="relative z-10 p-8">
                    <div className="mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-ink-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet group-hover:to-teal transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-ink-secondary text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="relative z-10 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl font-bold tracking-tight text-ink-white sm:text-5xl mb-6">
                Tính Năng Nổi Bật
              </h2>
              <p className="text-xl text-ink-secondary max-w-3xl mx-auto">
                Khám phá những công cụ học tập tiên tiến nhất
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={benefit.title} className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl">
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <CardHeader className="relative z-10">
                    <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 w-fit">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-ink-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet group-hover:to-teal transition-all duration-300">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-ink-secondary leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Admin Demo Section */}
        {isAdmin(role, roleId) && (
          <section className="relative z-10 py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-200 text-sm font-medium mb-6">
                  <Star className="size-4" />
                  <span>Admin Dashboard</span>
                </div>
                <h2 className="font-headline text-4xl font-bold tracking-tight text-ink-white sm:text-5xl mb-6">
                  Quản lý Hệ thống
                </h2>
                <p className="text-xl text-ink-secondary mb-12 leading-relaxed">
                  Truy cập admin dashboard với đầy đủ tính năng quản lý users, lớp học, tenants và analytics
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href="/admin">
                    <Button size="lg" className="group rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-10 py-6 text-xl font-bold text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]">
                      <Star className="mr-3 size-6 group-hover:rotate-12 transition-transform" />
                      Admin Dashboard
                      <ArrowRight className="ml-3 size-6 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/admin-demo">
                    <Button size="lg" variant="ghost" className="group rounded-2xl px-10 py-6 text-xl font-bold text-ink-secondary transition-all duration-300 hover:text-white hover:bg-white/10">
                      <Zap className="mr-3 size-6 group-hover:scale-110 transition-transform" />
                      Demo Preview
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="relative z-10 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-headline text-4xl font-bold tracking-tight text-ink-white sm:text-5xl mb-6">
                Sẵn Sàng Bắt Đầu?
              </h2>
              <p className="text-xl text-ink-secondary mb-12 leading-relaxed">
                Tham gia hàng triệu học sinh đang khám phá vũ trụ tri thức cùng MathMind
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/auth/register">
                  <Button size="lg" className="group rounded-2xl bg-gradient-to-r from-violet to-teal px-10 py-6 text-xl font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.6)]">
                    <Rocket className="mr-3 size-6 group-hover:rotate-12 transition-transform" />
                    Bắt đầu miễn phí
                    <ArrowRight className="ml-3 size-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/practice">
                  <Button size="lg" variant="ghost" className="group rounded-2xl px-10 py-6 text-xl font-bold text-ink-secondary transition-all duration-300 hover:text-white hover:bg-white/10">
                    <Zap className="mr-3 size-6 group-hover:scale-110 transition-transform" />
                    Luyện tập ngay
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ClientOnlyWrapper>
  );
}
