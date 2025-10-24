'use client';

import Link from 'next/link';
import Logo from './logo';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, Home, Map, Brain, Target, GraduationCap, Bot, User } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const navLinks = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/roadmap', label: 'Lộ trình', icon: Map },
  { href: '/mindmap', label: 'MindMap', icon: Brain },
  { href: '/chat', label: 'AI Chat Bot', icon: Bot },
  { href: '/practice', label: 'Luyện tập', icon: Target },
  { href: '/class', label: 'Lớp học', icon: GraduationCap },
];

const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2",
        isActive
          ? "text-ink-white bg-white/10"
          : "text-ink-secondary hover:text-ink-white hover:bg-white/5"
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
};

const Navbar = () => {
  const { token, username, logout } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-surface/80 backdrop-blur-lg">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Logo />
          <div className="hidden md:flex md:items-center md:gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </div>
        </div>
        
        <div className="hidden items-center gap-4 md:flex">
          {!token ? (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-ink-secondary hover:text-ink-white">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="rounded-full bg-gradient-to-r from-violet to-teal text-white shadow-md transition-transform hover:scale-105">
                  🚀 Bắt đầu học
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="text-ink-secondary hover:text-ink-white">
                  <User className="size-5" />
                </Button>
              </Link>
              <Button variant="outline" onClick={logout}>
                Đăng xuất
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6 text-ink-secondary" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-surface border-white/10 w-[250px] sm:w-[300px]">
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-white/10">
                            <Logo />
                        </div>
                        <div className="flex flex-col gap-2 p-4">
                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-ink-secondary hover:bg-white/5 hover:text-ink-white">
                                    <link.icon className="size-5" />
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-auto p-4 border-t border-white/10 space-y-4">
                          {!token ? (
                            <>
                              <Link href="/auth/login" className="w-full">
                                <Button variant="ghost" className="w-full text-ink-secondary hover:bg-white/5 hover:text-ink-white">
                                  Đăng nhập
                                </Button>
                              </Link>
                              <Link href="/auth/register" className='w-full'>
                                  <Button className="w-full rounded-full bg-gradient-to-r from-violet to-teal text-white shadow-md transition-transform hover:scale-105">
                                  🚀 Bắt đầu học
                                  </Button>
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link href="/profile" className="block w-full text-center rounded-md px-3 py-2 text-base font-medium text-ink-secondary hover:bg-white/5 hover:text-ink-white">
                                <User className="inline-block size-5 mr-2" />
                                Hồ sơ
                              </Link>
                              <Button className="w-full" variant="outline" onClick={logout}>
                                Đăng xuất
                              </Button>
                            </>
                          )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>

      </nav>
    </header>
  );
};

export default Navbar;
