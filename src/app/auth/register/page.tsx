'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Rocket, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const userTypes = [
  {
    id: 'student',
    title: 'Học Sinh',
    icon: '/student.png',
    description: 'Khám phá toán học qua các bài học tương tác',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'teacher',
    title: 'Giáo Viên',
    icon: '/teacher.png',
    description: 'Tạo bài giảng và theo dõi tiến độ học sinh',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'guardian',
    title: 'Phụ Huynh',
    icon: '/parent.png',
    description: 'Theo dõi sự phát triển của con em',
    color: 'from-orange-500 to-red-500',
  }
];

export default function RegisterPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const router = useRouter();

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      router.push(`/auth/register/${selectedType}`);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col max-w-none">
      {/* Header Navigation */}
      <div className="w-full py-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group absolute top-6 left-6 z-10"
        >
          <div className="p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-sm font-medium">Về trang chủ</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col max-w-none">
        {/* Hero Section */}
        <div className="text-center mb-16 w-full py-12 hero-full-width">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 backdrop-blur-sm mb-8">
            <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
            <span className="text-sm font-medium text-purple-200">Bắt đầu hành trình của bạn</span>
            <Zap className="w-4 h-4 text-cyan-300" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Chào mừng đến </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-gradient">
              MathMind
            </span>
          </h1>

          <p className="text-xl text-white/60 w-full leading-relaxed">
            Chọn vai trò của bạn để khám phá thế giới toán học đầy màu sắc
          </p>
        </div>

        {/* User Type Cards */}
        <div className="w-full mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full px-4 lg:px-8 xl:px-12 max-w-none full-width-grid">
          {userTypes.map((type, index) => (
            <button
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className="group relative"
              style={{
                animation: 'fadeInUp 0.6s ease-out forwards',
                animationDelay: `${index * 0.1}s`,
                opacity: 0
              }}
            >
              {/* Card Glow */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${type.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500 ${
                selectedType === type.id ? 'opacity-75' : ''
              }`} />
              
              {/* Card Content */}
              <div className={`relative bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border transition-all duration-500 ${
                selectedType === type.id 
                  ? 'border-white/30 shadow-2xl scale-105' 
                  : 'border-white/10 hover:border-white/20 hover:scale-105'
              }`}>
                {/* Selected Indicator */}
                {selectedType === type.id && (
                  <div className="absolute -top-3 -right-3 p-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 shadow-lg animate-bounce">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Icon Container */}
                <div className="mb-6 relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${type.color} rounded-2xl blur-2xl opacity-0 group-hover:opacity-30 transition-all duration-500 ${
                    selectedType === type.id ? 'opacity-40' : ''
                  }`} />
                  <div className={`relative w-32 h-32 mx-auto p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 transition-all duration-500 ${
                    selectedType === type.id ? 'scale-110' : 'group-hover:scale-105'
                  }`}>
                    <Image
                      src={type.icon}
                      alt={type.title}
                      width={128}
                      height={128}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-3">
                  <h3 className={`text-2xl font-bold transition-all duration-300 ${
                    selectedType === type.id
                      ? `text-transparent bg-clip-text bg-gradient-to-r ${type.color}`
                      : 'text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400'
                  }`}>
                    {type.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {type.description}
                  </p>
                </div>

                {/* Selection Indicator */}
                <div className={`mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-2 transition-all duration-300 ${
                  selectedType === type.id ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse" />
                  <span className="text-xs font-medium text-white/80">Đã chọn</span>
                </div>
              </div>
            </button>
          ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="w-full px-4 lg:px-8 xl:px-12 mb-8">
          <Button
            onClick={handleContinue}
            disabled={!selectedType}
            size="lg"
            className={`group relative w-full px-12 py-6 text-lg font-semibold rounded-2xl overflow-hidden transition-all duration-300 ${
              selectedType 
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105' 
                : 'bg-white/10 cursor-not-allowed opacity-50'
            }`}
          >
          <span className="relative z-10 flex items-center gap-3 text-white">
            <Rocket className="w-5 h-5" />
            Tiếp tục
            <Sparkles className="w-5 h-5" />
          </span>
            {selectedType && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 w-full">
        <p className="text-white/50 text-sm">
          Đã có tài khoản?{' '}
          <Link 
            href="/auth/login" 
            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-semibold hover:from-purple-300 hover:to-cyan-300 transition-all"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .full-width-grid {
          width: 100vw;
          margin-left: calc(-50vw + 50%);
        }
        
        .hero-full-width {
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          padding-left: 2rem;
          padding-right: 2rem;
        }
      `}</style>
    </div>
  );
}