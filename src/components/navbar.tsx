'use client';

import Link from 'next/link';
import Logo from './logo';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, Home, Map, Brain, Target, GraduationCap, Bot, User, Rocket } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { usePermissions } from '@/hooks/use-permissions';

const navLinks = [
  { href: '/', label: 'Trang chủ', icon: Home, highlight: false },
  { href: '/roadmap', label: 'Lộ trình', icon: Map, highlight: false },
  { href: '/mindmap', label: 'MindMap', icon: Brain, highlight: true },
  { href: '/chat', label: 'AI Chat Bot', icon: Bot, highlight: false },
  { href: '/practice', label: 'Luyện tập', icon: Target, highlight: false },
  { href: '/class', label: 'Lớp học', icon: GraduationCap, highlight: false },
];

const NavLink = ({ href, label, icon: Icon, highlight = false }: { href: string; label: string; icon: any; highlight?: boolean }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  const getLinkClassName = () => {
    if (isActive) {
      return "text-ink-white bg-gradient-to-r from-violet/20 to-teal/20 border border-violet/30 shadow-lg";
    }
    if (highlight) {
      return "text-ink-white bg-gradient-to-r from-violet/10 to-teal/10 border border-violet/20 hover:from-violet/20 hover:to-teal/20 hover:border-violet/30 hover:shadow-lg hover:scale-105";
    }
    return "text-ink-secondary hover:text-ink-white hover:bg-white/5";
  };

  const getIconClassName = () => {
    if (isActive) {
      return "text-violet-400";
    }
    if (highlight) {
      return "text-violet-300 group-hover:text-violet-400 group-hover:scale-110";
    }
    return "";
  };

  return (
    <Link
      href={href}
      className={cn(
        "group relative rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-2",
        getLinkClassName()
      )}
    >
      <Icon className={cn(
        "size-4 transition-transform duration-300",
        getIconClassName()
      )} />
      {label}
      {highlight && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-violet to-teal rounded-full animate-pulse" />
      )}
    </Link>
  );
};

const Navbar = () => {
  const { token, logout } = useAuth();
  const { canCreateClassroom } = usePermissions();
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
          {token ? (
            <>
              {/* Role-based quick actions */}
              {canCreateClassroom && (
                <Link href="/classroom/create">
                  <Button variant="outline" className="border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/20 transition-all duration-300">
                    <GraduationCap className="size-4 mr-2" />
                    Tạo lớp học
                  </Button>
                </Link>
              )}
              
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="text-ink-secondary hover:text-ink-white hover:bg-white/10 transition-all duration-300">
                  <User className="size-5" />
                </Button>
              </Link>
              <Button variant="outline" onClick={logout} className="border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300">
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="group text-ink-secondary hover:text-ink-white hover:bg-gradient-to-r hover:from-violet/10 hover:to-teal/10 border border-transparent hover:border-violet/20 transition-all duration-300">
                  <User className="size-4 mr-2 group-hover:scale-110 transition-transform" />
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="group rounded-2xl bg-gradient-to-r from-violet to-teal text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                  <Rocket className="size-4 mr-2 group-hover:rotate-12 transition-transform" />
                   Bắt đầu học
                </Button>
              </Link>
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
                            {navLinks.map((link) => {
                              const getMobileLinkClassName = () => {
                                if (link.highlight) {
                                  return "text-ink-white bg-gradient-to-r from-violet/10 to-teal/10 border border-violet/20 hover:from-violet/20 hover:to-teal/20 hover:border-violet/30 hover:shadow-lg";
                                }
                                return "text-ink-secondary hover:text-ink-white hover:bg-white/5";
                              };

                              const getMobileIconClassName = () => {
                                if (link.highlight) {
                                  return "text-violet-300 group-hover:text-violet-400 group-hover:scale-110";
                                }
                                return "";
                              };

                              return (
                                <Link 
                                    key={link.href} 
                                    href={link.href} 
                                    className={cn(
                                        "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all duration-300",
                                        getMobileLinkClassName()
                                    )}
                                >
                                    <link.icon className={cn(
                                        "size-5 transition-transform duration-300",
                                        getMobileIconClassName()
                                    )} />
                                    {link.label}
                                    {link.highlight && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-violet to-teal rounded-full animate-pulse" />
                                    )}
                                </Link>
                              );
                            })}
                        </div>
                        <div className="mt-auto p-4 border-t border-white/10 space-y-4">
                          {token ? (
                            <>
                              <Link href="/profile" className="block w-full text-center rounded-md px-3 py-2 text-base font-medium text-ink-secondary hover:bg-white/5 hover:text-ink-white">
                                <User className="inline-block size-5 mr-2" />
                                Hồ sơ
                              </Link>
                              <Button className="w-full" variant="outline" onClick={logout}>
                                Đăng xuất
                              </Button>
                            </>
                          ) : (
                            <>
                              <Link href="/auth/login" className="w-full">
                                <Button variant="ghost" className="w-full text-ink-secondary hover:bg-white/5 hover:text-ink-white">
                                  Đăng nhập
                                </Button>
                              </Link>
                              <Link href="/auth/register" className='w-full'>
                                  <Button className="w-full rounded-full bg-gradient-to-r from-violet to-teal text-white shadow-md transition-transform hover:scale-105">
                                   Bắt đầu học
                                  </Button>
                              </Link>
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
