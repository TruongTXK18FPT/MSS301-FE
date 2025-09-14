import { Orbit } from 'lucide-react';
import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 text-ink-white hover:text-ink-white/80 transition-colors">
      <div className="relative flex size-8 items-center justify-center rounded-full bg-violet/20">
        <Orbit className="size-6 text-violet" />
      </div>
      <span className="font-headline text-xl font-bold">MathMind</span>
    </Link>
  );
};

export default Logo;
