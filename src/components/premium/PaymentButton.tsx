/**
 * Payment Button Component
 * Integrated with PayOS payment flow
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { paymentService } from '@/lib/services/payment.service';
import { premiumService } from '@/lib/services/premium.service';
import type { PlanResponse } from '@/lib/dto/premium';

interface PaymentButtonProps {
  plan: PlanResponse;
  disabled?: boolean;
  className?: string;
}

export default function PaymentButton({
  plan,
  disabled = false,
  className = ''
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      // Step 1: Create subscription
      const subscriptionResponse = await premiumService.createSubscription({
        planId: plan.planId
      });

      if (!subscriptionResponse.result) {
        throw new Error('Failed to create subscription');
      }

      const subscription = subscriptionResponse.result;

      // Step 2: Create payment
      const paymentResponse = await paymentService.createPayment({
        subscriptionId: subscription.subscriptionId,
        planId: plan.planId,
        amount: plan.price,
        orderInfo: `${plan.name} - ${plan.billingCycle} tháng`
      });

      if (paymentResponse.result?.paymentUrl) {
        // Store orderId in sessionStorage for success page
        sessionStorage.setItem('pendingOrderId', paymentResponse.result.orderId);
        
        // Redirect to PayOS checkout
        window.location.href = paymentResponse.result.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error: any) {
      console.error('Payment creation failed:', error);
      
      toast({
        title: 'Lỗi thanh toán',
        description: error.response?.data?.message || error.message || 'Không thể tạo giao dịch thanh toán',
        variant: 'destructive'
      });
      
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className={className}
      size="lg"
    >
      {isLoading ? (
        <>
          <span className="animate-spin mr-2">⏳</span>
          Đang xử lý...
        </>
      ) : (
        <>
          Thanh toán {paymentService.formatAmount(plan.price)}
        </>
      )}
    </Button>
  );
}
