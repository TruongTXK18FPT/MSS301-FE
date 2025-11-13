/**
 * Premium/Subscription DTOs for MSS301 Backend API
 * Matches Java backend PlanResponse, SubscriptionResponse
 */

export type PlanStatus = 'ACTIVE' | 'INACTIVE';
export type SubscriptionStatus = 'PENDING_PAYMENT' | 'SUBSCRIBED' | 'EXPIRED' | 'CANCELLED';
export type Currency = 'VND';
export type Unit = 'MB' | 'GB';

// ============================================================================
// Entitlement DTOs
// ============================================================================

export interface EntitlementResponse {
  entitlementId: number;
  code: string;                        // E.g., "AI_MINDMAP_GEN"
  name: string;                        // E.g., "AI Mindmap Generation"
  description: string;
  defaultLimit: number;
  unit: Unit;
}

// ============================================================================
// Plan DTOs
// ============================================================================

export interface PlanResponse {
  planId: number;
  code: string;                       // E.g., "STELLAR_STUDENT"
  name: string;                       // E.g., "Stellar Student"
  description: string;
  billingCycle: number;               // Months
  price?: number;                     // Price in VND (not cents) - optional for backward compatibility
  currency: Currency;
  planStatus: PlanStatus;
  createdAt: string;
  updatedAt: string;
  entitlements?: EntitlementResponse[]; // List of entitlements for this plan
}

// ============================================================================
// Subscription DTOs
// ============================================================================

export interface SubscriptionResponse {
  subscriptionId: number;
  plan: PlanResponse;
  startDate?: string;                 // ISO 8601
  endDate?: string;                   // ISO 8601
  subscriptionStatus: SubscriptionStatus;
  renewal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequest {
  userId: number;                     // Required - User ID
  planId: number;                     // Required - Plan ID
  renewal?: boolean;                  // Optional - Default: false
  beneficiaryEmail?: string;          // Optional - For guardian purchases
}

export interface SubscriptionQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}
