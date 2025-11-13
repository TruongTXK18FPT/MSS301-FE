'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Rocket, Star, Crown, Zap, Check, Loader2, Calendar, Clock, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { premiumService } from '@/lib/services/premium.service';
import type { PlanResponse, SubscriptionResponse } from '@/lib/dto/premium';
import { useRouter } from 'next/navigation';

// Plan display metadata mapping
const PLAN_METADATA: Record<string, {
  icon: React.ReactNode;
  color: string;
  badge?: string;
  popular?: boolean;
}> = {
  'STELLAR_STUDENT': {
    icon: <Star className="w-8 h-8" />,
    color: 'from-blue-500 via-cyan-500 to-teal-500',
  },
  'GALAXY_EXPLORER': {
    icon: <Rocket className="w-8 h-8" />,
    color: 'from-purple-500 via-pink-500 to-rose-500',
    badge: 'TIẾT KIỆM 17%',
    popular: true,
  },
  'UNIVERSE_MASTER': {
    icon: <Crown className="w-8 h-8" />,
    color: 'from-amber-500 via-orange-500 to-red-500',
    badge: 'TIẾT KIỆM 25%',
  },
};

export default function PremiumPage() {
  const router = useRouter();
  const { role, id } = useAuth();
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionResponse | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadPlans();
    if (id) {
      loadCurrentSubscription();
      loadSubscriptionHistory();
    }
  }, [id]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await premiumService.getPlans();
      if (response.result) {
        // Filter only active plans and student plans (STELLAR, GALAXY, UNIVERSE)
        const studentPlans = response.result.filter(
          plan => plan.planStatus === 'ACTIVE' && 
                  (plan.code === 'STELLAR_STUDENT' || 
                   plan.code === 'GALAXY_EXPLORER' || 
                   plan.code === 'UNIVERSE_MASTER')
        )
        .sort((a, b) => (a.price ?? 0) - (b.price ?? 0)); // Sort by price ascending
        setPlans(studentPlans);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentSubscription = async () => {
    if (!id) return;
    try {
      const userId = parseInt(id);
      const response = await premiumService.getCurrentSubscription(userId);
      if (response.result) {
        setCurrentSubscription(response.result);
      } else {
        setCurrentSubscription(null);
      }
    } catch (error) {
      console.error('Failed to load current subscription:', error);
      setCurrentSubscription(null);
    }
  };

  const loadSubscriptionHistory = async () => {
    if (!id) return;
    try {
      const userId = parseInt(id);
      const response = await premiumService.getSubscriptionHistory(userId);
      if (response.result) {
        setSubscriptionHistory(response.result);
      }
    } catch (error) {
      console.error('Failed to load subscription history:', error);
    }
  };

  const handlePurchase = (planId: number) => {
    setSelectedPlan(planId);
    // Redirect to payment flow
    router.push(`/payment?planId=${planId}`);
  };

  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null) {
      return '0';
    }
    return price.toLocaleString('vi-VN');
  };

  const getBillingCycleText = (months: number): string => {
    if (months === 1) return '1 tháng';
    if (months === 6) return '6 tháng';
    if (months === 12) return '1 năm';
    return `${months} tháng`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Đang tải các gói Premium...</p>
        </div>
      </div>
    );
  }

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

        {/* Current Subscription Card */}
        {currentSubscription && currentSubscription.subscriptionStatus === 'SUBSCRIBED' && (
          <Card className="mb-8 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Crown className="w-6 h-6 text-yellow-400" />
                Gói Premium Hiện Tại
              </CardTitle>
              <CardDescription className="text-gray-300">
                Bạn đang sử dụng gói Premium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {currentSubscription.plan.name}
                  </h3>
                  <div className="flex items-center gap-4 text-gray-300">
                    {currentSubscription.startDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Bắt đầu: {new Date(currentSubscription.startDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    )}
                    {currentSubscription.endDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Hết hạn: {new Date(currentSubscription.endDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowHistory(!showHistory)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <History className="w-4 h-4 mr-2" />
                  {showHistory ? 'Ẩn' : 'Xem'} Lịch Sử
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription History */}
        {showHistory && subscriptionHistory.length > 0 && (
          <Card className="mb-8 bg-gray-900/80 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Lịch Sử Mua Gói</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptionHistory.map((sub) => (
                  <div
                    key={sub.subscriptionId}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div>
                      <h4 className="font-semibold text-white">{sub.plan.name}</h4>
                      <p className="text-sm text-gray-400">
                        {sub.startDate && `Từ ${new Date(sub.startDate).toLocaleDateString('vi-VN')}`}
                        {sub.endDate && ` đến ${new Date(sub.endDate).toLocaleDateString('vi-VN')}`}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      sub.subscriptionStatus === 'SUBSCRIBED' 
                        ? 'bg-green-500/20 text-green-400' 
                        : sub.subscriptionStatus === 'EXPIRED'
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {sub.subscriptionStatus === 'SUBSCRIBED' ? 'Đang hoạt động' :
                       sub.subscriptionStatus === 'EXPIRED' ? 'Hết hạn' :
                       sub.subscriptionStatus === 'CANCELLED' ? 'Đã hủy' : 'Chờ thanh toán'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Title for student section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-6 h-6 text-blue-400" />
            <h2 className="text-3xl font-bold text-white">Gói Học Sinh</h2>
          </div>
          <p className="text-gray-400">
            {currentSubscription && currentSubscription.subscriptionStatus === 'SUBSCRIBED'
              ? 'Bạn đã có gói Premium. Có thể nâng cấp lên gói cao hơn.'
              : 'Chọn gói phù hợp với nhu cầu học tập của bạn'}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {plans.map((plan, index) => {
            const metadata = PLAN_METADATA[plan.code] || {
              icon: <Star className="w-8 h-8" />,
              color: 'from-blue-500 to-purple-500'
            };

            return (
              <div
                key={plan.planId}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {metadata.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      {metadata.badge}
                    </span>
                  </div>
                )}
                {metadata.badge && !metadata.popular && (
                  <div className="absolute -top-4 right-4 z-10">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {metadata.badge}
                    </span>
                  </div>
                )}

                <Card
                  className={`relative overflow-hidden border-2 ${
                    metadata.popular
                      ? 'border-yellow-500 shadow-2xl shadow-yellow-500/20 scale-105'
                      : 'border-purple-500/20'
                  } bg-gray-900/80 backdrop-blur-sm hover:scale-105 transition-transform duration-300`}
                >
                  {/* Gradient overlay */}
                  <div
                    className={`absolute inset-0 opacity-10 bg-gradient-to-br ${metadata.color}`}
                  />

                  <div className="relative p-8">
                    {/* Icon */}
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${metadata.color} mb-6 hover:rotate-12 transition-transform duration-300`}>
                      {metadata.icon}
                    </div>

                    {/* Plan name */}
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-white">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="text-gray-400 ml-2">đ</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {getBillingCycleText(plan.billingCycle)}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-6">
                      {plan.description}
                    </p>

                    {/* Current Plan Badge */}
                    {currentSubscription && 
                     currentSubscription.subscriptionStatus === 'SUBSCRIBED' &&
                     currentSubscription.plan.planId === plan.planId && (
                      <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <p className="text-green-400 text-sm font-semibold text-center">
                          ✓ Bạn đang sử dụng gói này
                        </p>
                      </div>
                    )}

                    {/* CTA Button */}
                    {(() => {
                      const hasActiveSubscription = currentSubscription && 
                        currentSubscription.subscriptionStatus === 'SUBSCRIBED';
                      const isCurrentPlan = !!(hasActiveSubscription && 
                        currentSubscription.plan.planId === plan.planId);
                      const isUpgrade = !!(hasActiveSubscription && 
                        (plan.price ?? 0) > (currentSubscription.plan.price ?? 0));

                      return (
                        <Button
                          onClick={() => handlePurchase(plan.planId)}
                          disabled={selectedPlan === plan.planId || isCurrentPlan}
                          className={`w-full bg-gradient-to-r ${metadata.color} hover:opacity-90 text-white font-bold py-6 text-lg shadow-lg ${
                            isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {selectedPlan === plan.planId ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            isCurrentPlan 
                              ? 'Đang sử dụng' 
                              : isUpgrade 
                              ? 'Nâng cấp ngay' 
                              : 'Mua Ngay'
                          )}
                        </Button>
                      );
                    })()}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

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
