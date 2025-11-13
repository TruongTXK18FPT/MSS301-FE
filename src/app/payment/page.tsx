'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CreditCard, AlertCircle } from 'lucide-react';
import { premiumService } from '@/lib/services/premium.service';
import { paymentService } from '@/lib/services/payment.service';
import { useAuth } from '@/context/auth-context';
import type { PlanResponse } from '@/lib/dto/premium';
import type { PaymentResponse } from '@/lib/dto/payment';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: userId } = useAuth();
  const planId = searchParams.get('planId');

  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load plan details
  useEffect(() => {
    if (!planId) {
      setError('Không tìm thấy thông tin gói premium');
      setLoading(false);
      return;
    }

    // Check if user is logged in
    if (!userId) {
      setError('Vui lòng đăng nhập để thanh toán');
      setLoading(false);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login?redirect=/payment?planId=' + planId);
      }, 2000);
      return;
    }

    const loadPlan = async () => {
      try {
        setLoading(true);
        const response = await premiumService.getPlan(Number(planId));
        if (response.result) {
          setPlan(response.result);
        } else {
          setError('Không tìm thấy gói premium');
        }
      } catch (err: any) {
        console.error('Failed to load plan:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin gói premium');
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [planId, userId, router]);

  // Handle payment creation
  const handlePayment = async () => {
    if (!plan || !planId) return;

    try {
      setProcessing(true);
      setError(null);

      // Step 1: Create subscription
      if (!userId) {
        throw new Error('Vui lòng đăng nhập để thanh toán');
      }

      const subscriptionResponse = await premiumService.createSubscription({
        userId: Number(userId),
        planId: Number(planId),
        renewal: false,
      });

      if (!subscriptionResponse || !subscriptionResponse.result) {
        const errorMsg = subscriptionResponse?.message || 'Không thể tạo subscription';
        console.error('Subscription creation failed:', subscriptionResponse);
        throw new Error(errorMsg);
      }

      const subscriptionId = subscriptionResponse.result.subscriptionId;

      // Step 2: Create payment
      const paymentResponse = await paymentService.createPayment({
        subscriptionId: subscriptionId,
        planId: Number(planId),
        amount: plan.price ?? 0,
        orderInfo: `${plan.name} - ${plan.billingCycle === 1 ? '1 tháng' : `${plan.billingCycle} tháng`}`,
      });

      if (!paymentResponse.result || !paymentResponse.result.paymentUrl) {
        throw new Error('Không thể tạo thanh toán');
      }

      // Step 3: Store orderId for success page
      sessionStorage.setItem('pendingOrderId', paymentResponse.result.orderId);

      // Step 4: Redirect to PayOS
      window.location.href = paymentResponse.result.paymentUrl;
    } catch (err: any) {
      console.error('Payment creation failed:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Không thể tạo thanh toán. Vui lòng thử lại.'
      );
      setProcessing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-gray-900/80 backdrop-blur-sm border-purple-500/20">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 animate-spin text-purple-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-white">Đang tải thông tin...</h2>
            <p className="text-gray-400">Vui lòng đợi trong giây lát</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-gray-900/80 backdrop-blur-sm border-red-500/20">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-white">Lỗi</h2>
            <p className="text-gray-400 mb-6 text-center">{error || 'Không tìm thấy gói premium'}</p>
            <Button onClick={() => router.push('/premium')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại trang Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment form
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-gray-900/80 backdrop-blur-sm border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-3xl text-white flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-purple-400" />
            Thanh Toán Premium
          </CardTitle>
          <CardDescription className="text-gray-300">
            Hoàn tất thanh toán để kích hoạt gói Premium của bạn
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plan Details */}
          <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Thông tin gói</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Tên gói:</span>
                <span className="font-semibold text-white">{plan.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Thời hạn:</span>
                <span className="text-white">
                  {plan.billingCycle === 1 ? '1 tháng' : `${plan.billingCycle} tháng`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Mô tả:</span>
                <span className="text-white text-right max-w-xs">{plan.description}</span>
              </div>
              
              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-300">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-purple-400">
                    {paymentService.formatAmount(plan.price ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Entitlements */}
          {plan.entitlements && plan.entitlements.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tính năng bao gồm:</h3>
              <ul className="space-y-2">
                {plan.entitlements.map((entitlement) => (
                  <li key={entitlement.entitlementId} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">
                      <span className="font-medium">{entitlement.name}</span>
                      {entitlement.defaultLimit > 0 && (
                        <span className="text-gray-400">
                          {' '}({entitlement.defaultLimit} {entitlement.unit})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/premium')}
              variant="outline"
              className="flex-1"
              disabled={processing}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Thanh toán ngay
                </>
              )}
            </Button>
          </div>

          {/* Payment info */}
          <div className="text-center text-xs text-gray-500">
            Bạn sẽ được chuyển đến cổng thanh toán PayOS để hoàn tất giao dịch
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

