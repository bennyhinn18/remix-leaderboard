// Common fetcher response types for better type safety

export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export type FetcherResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Specific response types for different endpoints
export interface NotificationResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface RollNumberUpdateResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export interface ProjectShowcaseResponse {
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// Type guard functions
export function isSuccessResponse<T>(response: any): response is SuccessResponse<T> {
  return response && response.success === true;
}

export function isErrorResponse(response: any): response is ErrorResponse {
  return response && response.success === false && typeof response.error === 'string';
}

// Helper to safely access fetcher data
export function safeFetcherData<T = any>(fetcherData: unknown): {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
} {
  if (!fetcherData || typeof fetcherData !== 'object') {
    return {};
  }
  
  return fetcherData as any;
}
