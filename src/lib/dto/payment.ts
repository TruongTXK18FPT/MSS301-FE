/**
 * Payment DTOs for MSS301 Backend API
 * Matches Java backend PaymentCommand, PaymentQuery, PaymentRequest
 */

// ============================================================================
// Payment Status Types
// ============================================================================

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

// ============================================================================
// Payment Request/Response DTOs
// ============================================================================

export interface PaymentRequest {
  userId?: number;           // Auto-filled from JWT token
  subscriptionId: number;    // Subscription ID from premium-service
  planId: number;            // Plan being purchased
  amount: number;            // Amount in VND (must match plan price)
  orderInfo: string;         // Payment description
}

export interface PaymentResponse {
  orderId: string;                    // UUID - Payment unique ID
  userId: number;
  subscriptionId: number;
  planId: number;
  amount: number;                     // Amount in VND
  orderInfo: string;
  
  // PayOS specific fields
  payosPaymentLinkId?: string;        // PayOS payment link ID
  payosTransactionRef?: string;       // PayOS transaction reference
  paymentUrl: string;                 // PayOS checkout URL - redirect user here!
  
  // Bank transaction details (available after payment)
  bankCode?: string;                  // E.g., "970416" (ACB)
  bankName?: string;                  // E.g., "Asia Commercial Bank"
  accountNumber?: string;
  counterAccountName?: string;        // Payer's account name
  counterAccountNumber?: string;      // Payer's account number
  transactionDatetime?: string;       // ISO 8601 timestamp
  
  // Metadata
  status: PaymentStatus;
  createdAt: string;                  // ISO 8601
  updatedAt: string;                  // ISO 8601
}

// ============================================================================
// Pagination Types (Spring Data)
// ============================================================================

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface Page<T> {
  content: T[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface PaymentQueryParams {
  page?: number;                      // Default: 0
  size?: number;                      // Default: 10
  sort?: string;                      // Default: "createdAt,desc"
}

// ============================================================================
// Payment Helper Types
// ============================================================================

export interface PaymentStatusCheck {
  orderId: string;
  status: PaymentStatus;
  isComplete: boolean;           // true if SUCCESS, FAILED, or CANCELLED
  canRetry: boolean;             // true if FAILED or CANCELLED
}

export interface CreatePaymentPayload {
  subscriptionId: number;
  planId: number;
  amount: number;
  orderInfo?: string;
}
