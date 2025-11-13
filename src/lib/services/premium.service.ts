/**
 * Premium/Subscription Service
 * Handles plan listing and subscription management
 */

import { gatewayApi } from './axios';
import { ApiResponse } from '@/lib/dto/common';
import type {
  PlanResponse,
  SubscriptionResponse,
  CreateSubscriptionRequest,
  SubscriptionQueryParams
} from '@/lib/dto/premium';

// ============================================================================
// API Endpoints
// ============================================================================

const PREMIUM_BASE = '/api/v1/premium';

// ============================================================================
// Premium Service
// ============================================================================

export const premiumService = {
  /**
   * Get all available plans
   * 
   * @returns List of all plans
   */
  async getPlans(): Promise<ApiResponse<PlanResponse[]>> {
    const response = await gatewayApi.get<ApiResponse<PlanResponse[]>>(`${PREMIUM_BASE}/plans`);
    return response.data;
  },

  /**
   * Get plan by ID
   * 
   * @param planId Plan ID
   * @returns Plan details
   */
  async getPlan(planId: number): Promise<ApiResponse<PlanResponse>> {
    const response = await gatewayApi.get<ApiResponse<PlanResponse>>(`${PREMIUM_BASE}/plans/${planId}`);
    return response.data;
  },

  /**
   * Create a new subscription (without payment)
   * This creates a subscription in PENDING_PAYMENT status
   * 
   * @param request Subscription creation request
   * @returns Created subscription
   */
  async createSubscription(request: CreateSubscriptionRequest): Promise<ApiResponse<SubscriptionResponse>> {
    const response = await gatewayApi.post<ApiResponse<SubscriptionResponse>>(
      `${PREMIUM_BASE}/subscriptions`,
      request
    );
    return response.data;
  },

  /**
   * Get user's current active subscription
   * 
   * @param userId User ID
   * @returns User's current active subscription (or null if none)
   */
  async getCurrentSubscription(userId: number): Promise<ApiResponse<SubscriptionResponse | null>> {
    const response = await gatewayApi.get<ApiResponse<SubscriptionResponse | null>>(
      `${PREMIUM_BASE}/subscriptions/user/${userId}/current`
    );
    return response.data;
  },

  /**
   * Get user's subscription history
   * 
   * @param userId User ID
   * @returns List of all user's subscriptions (ordered by creation date)
   */
  async getSubscriptionHistory(userId: number): Promise<ApiResponse<SubscriptionResponse[]>> {
    const response = await gatewayApi.get<ApiResponse<SubscriptionResponse[]>>(
      `${PREMIUM_BASE}/subscriptions/user/${userId}/history`
    );
    return response.data;
  },

  /**
   * Cancel a subscription
   * 
   * @param subscriptionId Subscription ID
   * @returns Updated subscription
   */
  async cancelSubscription(subscriptionId: number): Promise<ApiResponse<SubscriptionResponse>> {
    const response = await gatewayApi.post<ApiResponse<SubscriptionResponse>>(
      `${PREMIUM_BASE}/subscriptions/${subscriptionId}/cancel`
    );
    return response.data;
  },

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId: number): Promise<boolean> {
    try {
      const response = await this.getCurrentSubscription(userId);
      return response.result !== null && response.result.subscriptionStatus === 'SUBSCRIBED';
    } catch (error) {
      return false;
    }
  },

  /**
   * Get plan by code
   */
  async getPlanByCode(code: string): Promise<PlanResponse | null> {
    try {
      const response = await this.getPlans();
      return response.result?.find(plan => plan.code === code) || null;
    } catch (error) {
      return null;
    }
  }
};

export default premiumService;
