import Link from 'next/link';
import { Button } from './ui/button';
import Logo from './logo';
import { Github, Facebook, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-surface/50 border-t border-white/5 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-8 py-16 text-center">
          <h2 className="font-headline text-3xl font-bold text-ink-white sm:text-4xl">
            Tham gia vũ trụ Toán học
          </h2>
          <p className="max-w-xl text-ink-secondary">
            Bắt đầu hành trình của bạn ngay hôm nay. Khám phá, học hỏi và chinh phục các thử thách toán học với MathMind.
          </p>
          <Link href="/register">
            <Button size="lg" className="rounded-full bg-gradient-to-r from-violet to-teal px-8 py-6 text-lg font-semibold text-white shadow-[0_0_24px_rgba(57,160,255,0.35)] transition-transform hover:scale-105">
              🚀 Bắt đầu miễn phí
            </Button>
          </Link>
          <div className="flex space-x-6">
            <Link href="#" className="text-ink-secondary hover:text-white transition-colors"><Youtube /></Link>
            <Link href="#" className="text-ink-secondary hover:text-white transition-colors"><Twitter /></Link>
            <Link href="#" className="text-ink-secondary hover:text-white transition-colors"><Facebook /></Link>
            <Link href="#" className="text-ink-secondary hover:text-white transition-colors"><Github /></Link>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between border-t border-white/5 py-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm text-ink-secondary">&copy; MathMind 2025. All rights reserved.</span>
          </div>
          <div className="mt-4 flex space-x-6 text-sm md:mt-0">
            <Link href="#" className="text-ink-secondary hover:text-white">Chính sách</Link>
            <Link href="#" className="text-ink-secondary hover:text-white">Điều khoản</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
