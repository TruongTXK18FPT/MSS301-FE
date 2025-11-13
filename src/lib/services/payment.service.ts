/**
 * Payment Service for PayOS Integration
 * Handles payment creation, status checking, and user payment history
 */

import { gatewayApi } from './axios';
import { ApiResponse } from '@/lib/dto/common';
import type {
  PaymentRequest,
  PaymentResponse,
  Page,
  PaymentQueryParams,
  PaymentStatusCheck,
  PaymentStatus
} from '@/lib/dto/payment';

// ============================================================================
// API Endpoints
// ============================================================================

const PAYMENT_BASE = '/api/v1/payment';

// ============================================================================
// Payment Service
// ============================================================================

export const paymentService = {
  /**
   * Create a new payment and get PayOS checkout URL
   * 
   * @param request Payment request data
   * @returns Payment response with paymentUrl to redirect user
   * 
   * @example
   * const payment = await paymentService.createPayment({
   *   subscriptionId: 123,
   *   planId: 1,
   *   amount: 10000,
   *   orderInfo: "Stellar Student - 1 month"
   * });
   * 
   * // Redirect to PayOS
   * window.location.href = payment.result.paymentUrl;
   */
  async createPayment(request: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    const response = await gatewayApi.post<ApiResponse<PaymentResponse>>(
      `${PAYMENT_BASE}/create`,
      request
    );
    return response.data;
  },

  /**
   * Get payment details by order ID
   * 
   * @param orderId Payment order ID (UUID)
   * @returns Payment details
   */
  async getPayment(orderId: string): Promise<ApiResponse<PaymentResponse>> {
    const response = await gatewayApi.get<ApiResponse<PaymentResponse>>(
      `${PAYMENT_BASE}/${orderId}`
    );
    return response.data;
  },

  /**
   * Get all payments for a user (paginated)
   * 
   * @param userId User ID
   * @param params Query parameters (page, size, sort)
   * @returns Paginated payment list
   */
  async getUserPayments(
    userId: number,
    params: PaymentQueryParams = {}
  ): Promise<ApiResponse<Page<PaymentResponse>>> {
    const response = await gatewayApi.get<ApiResponse<Page<PaymentResponse>>>(
      `${PAYMENT_BASE}/user/${userId}`,
      {
        params: {
          page: params.page ?? 0,
          size: params.size ?? 10,
          sort: params.sort ?? 'createdAt,desc'
        }
      }
    );
    return response.data;
  },

  /**
   * Get all payments (admin only)
   */
  async getAllPayments(): Promise<ApiResponse<PaymentResponse[]>> {
    const response = await gatewayApi.get<ApiResponse<PaymentResponse[]>>(PAYMENT_BASE);
    return response.data;
  },

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Check payment status and determine if it's complete
   */
  async checkPaymentStatus(orderId: string): Promise<PaymentStatusCheck> {
    const response = await this.getPayment(orderId);
    const payment = response.result;

    if (!payment) {
      throw new Error('Payment not found');
    }

    const isComplete = ['SUCCESS', 'FAILED', 'CANCELLED'].includes(payment.status);
    const canRetry = ['FAILED', 'CANCELLED'].includes(payment.status);

    return {
      orderId: payment.orderId,
      status: payment.status,
      isComplete,
      canRetry
    };
  },

  /**
   * Process payment from PayOS return URL params
   * This triggers backend to process payment when user is redirected back
   * 
   * @param params Return URL parameters from PayOS
   */
  async processPaymentFromReturnUrl(params: {
    orderCode?: string;
    code: string;
    id: string; // paymentLinkId
    cancel?: string;
    status: string;
  }): Promise<void> {
    const queryParams = new URLSearchParams();
    if (params.orderCode) queryParams.append('orderCode', params.orderCode);
    queryParams.append('code', params.code);
    queryParams.append('id', params.id);
    if (params.cancel) queryParams.append('cancel', params.cancel);
    queryParams.append('status', params.status);

    await gatewayApi.get(
      `${PAYMENT_BASE}/callback/payos/return?${queryParams.toString()}`
    );
  },

  /**
   * Poll payment status until it's complete
   * Useful for waiting on the success page
   * 
   * @param orderId Payment order ID
   * @param maxAttempts Maximum polling attempts (default: 30)
   * @param intervalMs Polling interval in milliseconds (default: 2000)
   * @returns Final payment response
   */
  async pollPaymentStatus(
    orderId: string,
    maxAttempts: number = 30,
    intervalMs: number = 2000
  ): Promise<PaymentResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const statusCheck = await this.checkPaymentStatus(orderId);

      if (statusCheck.isComplete) {
        const response = await this.getPayment(orderId);
        return response.result!;
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error('Payment status check timeout');
  },

  /**
   * Format amount to VND currency string
   * Amount is already in VND (not cents)
   */
  formatAmount(amount: number | undefined | null): string {
    if (amount === undefined || amount === null) {
      return '0 đ';
    }
    return `${amount.toLocaleString('vi-VN')} đ`;
  },

  /**
   * Get payment status badge color (Tailwind CSS classes)
   */
  getStatusColor(status: PaymentStatus): string {
    const colors: Record<PaymentStatus, string> = {
      PENDING: 'bg-gray-500',
      PROCESSING: 'bg-blue-500',
      SUCCESS: 'bg-green-500',
      FAILED: 'bg-red-500',
      CANCELLED: 'bg-yellow-500'
    };
    return colors[status] || 'bg-gray-500';
  },

  /**
   * Get payment status text in Vietnamese
   */
  getStatusText(status: PaymentStatus): string {
    const texts: Record<PaymentStatus, string> = {
      PENDING: 'Chờ xử lý',
      PROCESSING: 'Đang xử lý',
      SUCCESS: 'Thành công',
      FAILED: 'Thất bại',
      CANCELLED: 'Đã hủy'
    };
    return texts[status] || status;
  }
};

export default paymentService;
