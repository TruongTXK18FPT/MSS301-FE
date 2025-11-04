'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Rocket, Star, Crown, Zap, Check, Globe, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';

interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  popular?: boolean;
  badge?: string;
}

const studentPlans: PremiumPlan[] = [
  {
    id: 'student-monthly',
    name: 'Stellar Student',
    price: 99000,
    duration: '1 tháng',
    icon: <Star className="w-8 h-8" />,
    color: 'from-blue-500 via-cyan-500 to-teal-500',
    features: [
      '✨ Không giới hạn AI mindmap generation',
      '🎯 Truy cập toàn bộ bài tập nâng cao',
      '📊 Phân tích chi tiết tiến độ học tập',
      '🔔 Thông báo ưu tiên và nhắc nhở học tập',
      '💾 Lưu trữ không giới hạn mindmap',
      '🎨 Themes và icons cao cấp',
    ],
  },
  {
    id: 'student-semester',
    name: 'Galaxy Explorer',
    price: 499000,
    duration: '6 tháng',
    icon: <Rocket className="w-8 h-8" />,
    color: 'from-purple-500 via-pink-500 to-rose-500',
    popular: true,
    badge: 'TIẾT KIỆM 17%',
    features: [
      '⭐ Tất cả tính năng Stellar Student',
      '🎓 Khóa học độc quyền từ giáo viên top',
      '🏆 Huy hiệu và thành tựu đặc biệt',
      '👥 Nhóm học tập premium',
      '📚 Thư viện tài liệu nâng cao',
      '🎁 2 tuần miễn phí cho bạn bè',
    ],
  },
  {
    id: 'student-yearly',
    name: 'Universe Master',
    price: 899000,
    duration: '1 năm',
    icon: <Crown className="w-8 h-8" />,
    color: 'from-amber-500 via-orange-500 to-red-500',
    badge: 'TIẾT KIỆM 25%',
    features: [
      '🌟 Tất cả tính năng Galaxy Explorer',
      '🎯 Lộ trình học tập cá nhân hóa AI',
      '👨‍🏫 1-on-1 coaching session (2 buổi/tháng)',
      '🏅 Chứng chỉ hoàn thành khóa học',
      '💎 Quyền truy cập sớm tính năng mới',
      '🎉 Sự kiện học viên VIP',
    ],
  },
];

const parentPlans: PremiumPlan[] = [
  {
    id: 'parent-monthly',
    name: 'Family Orbit',
    price: 149000,
    duration: '1 tháng/1 con',
    icon: <Users className="w-8 h-8" />,
    color: 'from-emerald-500 via-green-500 to-lime-500',
    features: [
      '👨‍👩‍👧‍👦 Quản lý tối đa 3 tài khoản con',
      '📊 Dashboard theo dõi tiến độ chi tiết',
      '📈 Báo cáo học tập hàng tuần',
      '🔔 Cảnh báo khi con cần hỗ trợ',
      '💬 Chat trực tiếp với giáo viên',
      '🎯 Đặt mục tiêu học tập cho con',
    ],
  },
  {
    id: 'parent-semester',
    name: 'Solar System',
    price: 799000,
    duration: '6 tháng/3 con',
    icon: <Globe className="w-8 h-8" />,
    color: 'from-indigo-500 via-purple-500 to-pink-500',
    popular: true,
    badge: 'PHỔ BIẾN NHẤT',
    features: [
      '⭐ Tất cả tính năng Family Orbit',
      '👨‍👩‍👧‍👦 Quản lý tối đa 5 tài khoản con',
      '📱 Ứng dụng phụ huynh di động',
      '🎓 Tư vấn giáo dục từ chuyên gia',
      '📊 Phân tích so sánh với bạn cùng lớp',
      '🎁 Miễn phí 1 tháng khi mời phụ huynh khác',
    ],
  },
  {
    id: 'parent-yearly',
    name: 'Cosmic Guardian',
    price: 1499000,
    duration: '1 năm/5 con',
    icon: <Crown className="w-8 h-8" />,
    color: 'from-rose-500 via-fuchsia-500 to-purple-500',
    badge: 'BEST VALUE',
    features: [
      '🌟 Tất cả tính năng Solar System',
      '👨‍👩‍👧‍👦 Không giới hạn số tài khoản con',
      '🎯 Kế hoạch phát triển cá nhân cho từng con',
      '👨‍🏫 Buổi tư vấn 1-1 với chuyên gia (4 buổi/năm)',
      '📚 Truy cập thư viện phụ huynh cao cấp',
      '🏆 Ưu đãi đặc biệt cho sự kiện và workshop',
    ],
  },
];

const teacherPlans: PremiumPlan[] = [
  {
    id: 'teacher-monthly',
    name: 'Educator Star',
    price: 199000,
    duration: '1 tháng',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'from-violet-500 via-purple-500 to-fuchsia-500',
    features: [
      '👨‍🏫 Tạo lớp học không giới hạn',
      '📊 Quản lý tối đa 100 học sinh',
      '🎯 Công cụ tạo bài kiểm tra AI',
      '📈 Phân tích chi tiết từng học sinh',
      '💾 Thư viện tài liệu giảng dạy',
      '🎨 Template bài giảng chuyên nghiệp',
    ],
  },
  {
    id: 'teacher-semester',
    name: 'Master Instructor',
    price: 999000,
    duration: '6 tháng',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-cyan-500 via-blue-500 to-indigo-500',
    popular: true,
    badge: 'RECOMMENDED',
    features: [
      '⭐ Tất cả tính năng Educator Star',
      '👥 Quản lý tối đa 300 học sinh',
      '🎓 Công cụ AI phân loại học sinh',
      '📊 Dashboard analytics nâng cao',
      '💬 Forum riêng cho lớp học',
      '🎁 Tặng 10 tài khoản premium cho học sinh xuất sắc',
    ],
  },
  {
    id: 'teacher-yearly',
    name: 'Academy Legend',
    price: 1799000,
    duration: '1 năm',
    icon: <Crown className="w-8 h-8" />,
    color: 'from-amber-500 via-yellow-500 to-orange-500',
    badge: 'PROFESSIONAL',
    features: [
      '🌟 Tất cả tính năng Master Instructor',
      '👥 Không giới hạn số lượng học sinh',
      '🎯 Tạo khóa học và bán trên nền tảng',
      '💰 Nhận 70% doanh thu từ khóa học',
      '🏆 Huy hiệu giáo viên xuất sắc',
      '🎓 Chương trình đào tạo giáo viên',
      '💎 Ưu tiên hỗ trợ 24/7',
    ],
  },
];

export default function PremiumPage() {
  const { role } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'student' | 'parent' | 'teacher'>('student');

  useEffect(() => {
    // Auto select tab based on user role
    if (role === 'PARENT') {
      setActiveTab('parent');
    } else if (role === 'TEACHER') {
      setActiveTab('teacher');
    } else {
      setActiveTab('student');
    }
  }, [role]);

  const currentPlans = activeTab === 'student' ? studentPlans : 
                       activeTab === 'parent' ? parentPlans : teacherPlans;

  const handlePurchase = (planId: string) => {
    setSelectedPlan(planId);
    // TODO: Integrate with payment service
    console.log('Purchasing plan:', planId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950 relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-6 animate-scale-in">
            <div className="relative">
              <Sparkles className="w-20 h-20 text-purple-400 mx-auto" />
              <div className="absolute inset-0 blur-xl bg-purple-500/30 rounded-full" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-fade-in-up">
            Nâng Cấp Lên Vũ Trụ
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Khám phá tiềm năng vô hạn với Premium
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-12">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-gray-900/50 backdrop-blur-sm border border-purple-500/20">
            <TabsTrigger
              value="student"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500"
            >
              <Star className="w-4 h-4 mr-2" />
              Học Sinh
            </TabsTrigger>
            <TabsTrigger
              value="parent"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500"
            >
              <Users className="w-4 h-4 mr-2" />
              Phụ Huynh
            </TabsTrigger>
            <TabsTrigger
              value="teacher"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Giáo Viên
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-12">
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {currentPlans.map((plan, index) => (
                <div
                  key={plan.id}
                  className="relative animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  {plan.badge && !plan.popular && (
                    <div className="absolute -top-4 right-4 z-10">
                      <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <Card
                    className={`relative overflow-hidden border-2 ${
                      plan.popular
                        ? 'border-yellow-500 shadow-2xl shadow-yellow-500/20 scale-105'
                        : 'border-purple-500/20'
                    } bg-gray-900/80 backdrop-blur-sm hover:scale-105 transition-transform duration-300`}
                  >
                    {/* Gradient overlay */}
                    <div
                      className={`absolute inset-0 opacity-10 bg-gradient-to-br ${plan.color}`}
                    />

                    <div className="relative p-8">
                      {/* Icon */}
                      <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br ${plan.color} mb-6 hover:rotate-12 transition-transform duration-300">
                        {plan.icon}
                      </div>

                      {/* Plan name */}
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {plan.name}
                      </h3>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold text-white">
                            {plan.price.toLocaleString('vi-VN')}
                          </span>
                          <span className="text-gray-400 ml-2">đ</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{plan.duration}</p>
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start text-gray-300 text-sm animate-fade-in-right"
                            style={{ animationDelay: `${index * 0.1 + idx * 0.05}s` }}
                          >
                            <Check className="w-5 h-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <Button
                        onClick={() => handlePurchase(plan.id)}
                        className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-bold py-6 text-lg shadow-lg`}
                      >
                        Chọn Gói Này
                      </Button>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Benefits section */}
        <div className="max-w-5xl mx-auto mt-20 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-3xl font-bold text-white mb-8">
            Tại Sao Chọn Premium?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Rocket className="w-12 h-12" />,
                title: 'Học Nhanh Hơn',
                desc: 'AI cá nhân hóa giúp bạn tiến bộ 3x nhanh hơn',
              },
              {
                icon: <Star className="w-12 h-12" />,
                title: 'Kết Quả Vượt Trội',
                desc: 'Học viên Premium đạt điểm cao hơn 40%',
              },
              {
                icon: <Crown className="w-12 h-12" />,
                title: 'Hỗ Trợ Ưu Tiên',
                desc: 'Đội ngũ chuyên gia hỗ trợ 24/7',
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="text-purple-400 mb-4 flex justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-400">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Money-back guarantee */}
        <div className="max-w-3xl mx-auto mt-16 text-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">
            Đảm Bảo Hoàn Tiền 100%
          </h3>
          <p className="text-gray-300">
            Nếu không hài lòng trong 30 ngày đầu, chúng tôi hoàn lại toàn bộ tiền.
            Không câu hỏi, không rắc rối.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-right {
          animation: fadeInRight 0.4s ease-out forwards;
          opacity: 0;
        }

        .animate-scale-in {
          animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
