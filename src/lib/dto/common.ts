// Common DTOs used across multiple services

/**
 * Standard API Response wrapper from Backend
 * @template T - The type of the result data
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T | null;
}
