import Link from 'next/link';
import Image from 'next/image';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-3 text-ink-white hover:text-ink-white/80 transition-colors">
      <div className="relative flex size-10 items-center justify-center">
        <Image 
          src="/mathmind.png" 
          alt="MathMind Logo" 
          width={40} 
          height={40}
          className="object-contain"
        />
      </div>
      <span className="font-headline text-xl font-bold bg-gradient-to-r from-violet to-teal bg-clip-text text-transparent">
        MathMind
      </span>
    </Link>
  );
};

export default Logo;
