import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Bot, BrainCircuit, BookOpen, Presentation } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const benefits = [
  {
    icon: <BrainCircuit className="size-8 text-accent" />,
    title: 'MindMap Trực Quan',
    description: 'Hệ thống hoá kiến thức một cách logic và sáng tạo.',
  },
  {
    icon: <Bot className="size-8 text-teal" />,
    title: 'Bài Tập AI',
    description: 'Luyện tập không giới hạn với các bài toán được AI tạo ra.',
  },
  {
    icon: <BookOpen className="size-8 text-neon-blue" />,
    title: 'Giải Thích Thông Minh',
    description: 'Nhận gợi ý và giải thích chi tiết từ trợ lý AI.',
  },
  {
    icon: <Presentation className="size-8 text-gold" />,
    title: 'Dashboard Lớp Học',
    description: 'Theo dõi tiến độ, quản lý bài tập và tương tác với giáo viên.',
  },
];

export default function Home() {
  const mindmapImage = PlaceHolderImages.find(p => p.id === "1");
  const quizImage = PlaceHolderImages.find(p => p.id === "2");
  const dashboardImage = PlaceHolderImages.find(p => p.id === "3");

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <section className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-ink-white sm:text-5xl md:text-6xl">
          Khám phá vũ trụ <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet to-teal">Toán học</span> của bạn 🚀
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-secondary md:text-xl">
          MathMind biến mọi khái niệm phức tạp thành những hành trình khám phá đầy thú vị. Sẵn sàng để chinh phục các vì sao tri thức?
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/chat">
            <Button size="lg" className="rounded-full bg-gradient-to-r from-violet to-teal px-8 py-6 text-lg font-semibold text-white shadow-[0_0_24px_rgba(57,160,255,0.35)] transition-transform hover:scale-105">
              Bắt đầu học <ArrowRight className="ml-2 size-5" />
            </Button>
          </Link>
          <Link href="/practice">
            <Button size="lg" variant="ghost" className="rounded-full px-8 py-6 text-lg font-semibold text-ink-secondary transition-colors hover:text-white">
              Luyện tập ngay
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-24 sm:mt-32">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="rounded-2xl bg-surface/90 border border-white/5 shadow-xl transition-transform hover:scale-105 hover:-translate-y-2">
              <CardHeader>
                {benefit.icon}
                <CardTitle className="pt-4 text-xl font-semibold text-ink-white">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ink-secondary">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-24 sm:mt-32 text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-ink-white sm:text-4xl">
          Công Cụ Mạnh Mẽ Cho Hành Trình Của Bạn
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-secondary">
          Trực quan hoá lộ trình, theo dõi tiến độ và luyện tập hiệu quả.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-5">
            {mindmapImage && (
              <div className="md:col-span-3 rounded-2xl bg-white/5 p-4 border border-white/10 glow-on-hover">
                <Image
                  src={mindmapImage.imageUrl}
                  alt={mindmapImage.description}
                  data-ai-hint={mindmapImage.imageHint}
                  width={1800}
                  height={1200}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
            {quizImage && (
              <div className="md:col-span-2 rounded-2xl bg-white/5 p-4 border border-white/10 glow-on-hover">
                <Image
                  src={quizImage.imageUrl}
                  alt={quizImage.description}
                  data-ai-hint={quizImage.imageHint}
                  width={1200}
                  height={1200}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-8">
            {dashboardImage && (
              <div className="rounded-2xl bg-white/5 p-4 border border-white/10 glow-on-hover">
                  <Image
                  src={dashboardImage.imageUrl}
                  alt={dashboardImage.description}
                  data-ai-hint={dashboardImage.imageHint}
                  width={2400}
                  height={1200}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
        </div>
      </section>
    </div>
  );
}
