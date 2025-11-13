/**
 * Payment Success/Callback Page
 * Handles PayOS callback and displays payment status
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Crown, Calendar, Clock } from 'lucide-react';
import { paymentService } from '@/lib/services/payment.service';
import { premiumService } from '@/lib/services/premium.service';
import { useAuth } from '@/context/auth-context';
import type { PaymentResponse } from '@/lib/dto/payment';
import type { SubscriptionResponse } from '@/lib/dto/premium';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useAuth();
  
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get params from PayOS return URL
  const orderCode = searchParams.get('orderCode');
  const code = searchParams.get('code');
  const paymentLinkId = searchParams.get('id');
  const cancel = searchParams.get('cancel');
  const status = searchParams.get('status');

  useEffect(() => {
    const processPayment = async () => {
      try {
        // If we have PayOS return URL params, trigger payment processing
        if (paymentLinkId && code && status) {
          console.log('Processing payment from return URL params');
          
          // Call backend to process payment from return URL
          await paymentService.processPaymentFromReturnUrl({
            orderCode: orderCode || undefined,
            code,
            id: paymentLinkId,
            cancel: cancel || undefined,
            status
          });
        }

        // Get orderId from orderCode or sessionStorage
        const orderId = orderCode || sessionStorage.getItem('pendingOrderId');
        
        if (!orderId) {
          setError('Không tìm thấy thông tin thanh toán');
          setLoading(false);
          return;
        }

        // Poll payment status
        const result = await paymentService.pollPaymentStatus(orderId, 30, 2000);
        setPayment(result);
        
        // Clear pending orderId from sessionStorage
        sessionStorage.removeItem('pendingOrderId');

        // If payment successful, load current subscription
        if (result.status === 'SUCCESS' && id) {
          // Wait a bit for backend to process payment
          setTimeout(async () => {
            try {
              const userId = parseInt(id);
              const subscriptionResponse = await premiumService.getCurrentSubscription(userId);
              if (subscriptionResponse.result) {
                setCurrentSubscription(subscriptionResponse.result);
              }
            } catch (err) {
              console.error('Failed to load current subscription:', err);
            }
          }, 2000);
        }
      } catch (err: any) {
        console.error('Failed to process payment:', err);
        setError(err.response?.data?.message || err.message || 'Không thể xử lý thanh toán');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [orderCode, code, paymentLinkId, cancel, status, id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-gray-900/80 backdrop-blur-sm border-purple-500/20">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 animate-spin text-blue-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-white">Đang kiểm tra thanh toán...</h2>
            <p className="text-gray-400">Vui lòng đợi trong giây lát</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-gray-900/80 backdrop-blur-sm border-red-500/20">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-white">Lỗi thanh toán</h2>
            <p className="text-gray-400 mb-6 text-center">{error}</p>
            <Button onClick={() => router.push('/premium')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại trang Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (payment.status === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-gray-900/80 backdrop-blur-sm border-green-500/20">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-3xl text-white">Thanh toán thành công! 🎉</CardTitle>
            <CardDescription className="text-gray-300">
              Gói Premium của bạn đã được kích hoạt
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Payment Details */}
            <div className="bg-gray-800/50 rounded-lg p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Mã đơn hàng:</span>
                <span className="font-mono text-sm text-white">{payment.orderId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Số tiền:</span>
                <span className="font-semibold text-lg text-green-400">
                  {paymentService.formatAmount(payment.amount)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Thông tin đơn hàng:</span>
                <span className="text-white">{payment.orderInfo}</span>
              </div>
              
              {payment.bankName && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Ngân hàng:</span>
                  <span className="text-white">{payment.bankName}</span>
                </div>
              )}
              
              {payment.transactionDatetime && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Thời gian:</span>
                  <span className="text-white">
                    {new Date(payment.transactionDatetime).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
            </div>

            {/* Current Subscription Info */}
            {currentSubscription && currentSubscription.subscriptionStatus === 'SUBSCRIBED' && (
              <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">Gói Premium của bạn đã được kích hoạt!</h3>
                </div>
                <div className="space-y-2 text-gray-300">
                  <p className="text-lg font-semibold text-white">{currentSubscription.plan.name}</p>
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
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button 
                onClick={() => router.push('/')}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
              >
                Về Trang Chủ
              </Button>
              <Button 
                onClick={() => router.push('/premium')}
                variant="outline"
                className="flex-1"
              >
                Xem gói Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Failed/Cancelled state
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-gray-900/80 backdrop-blur-sm border-red-500/20">
        <CardHeader className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-3xl text-white">
            {payment.status === 'CANCELLED' ? 'Thanh toán đã hủy' : 'Thanh toán thất bại'}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {payment.status === 'CANCELLED' 
              ? 'Bạn đã hủy giao dịch thanh toán'
              : 'Giao dịch thanh toán không thành công'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="bg-gray-800/50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Mã đơn hàng:</span>
              <span className="font-mono text-sm text-white">{payment.orderId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Số tiền:</span>
              <span className="font-semibold text-white">
                {paymentService.formatAmount(payment.amount)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Trạng thái:</span>
              <span className={`px-3 py-1 rounded-full text-white text-sm ${paymentService.getStatusColor(payment.status)}`}>
                {paymentService.getStatusText(payment.status)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button 
              onClick={() => router.push('/premium')}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            >
              Thử lại thanh toán
            </Button>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về Trang Chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
