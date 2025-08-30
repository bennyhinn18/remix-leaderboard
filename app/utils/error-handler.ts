// Global error handling utilities
import { toast } from '~/hooks/use-toast';

export interface ErrorInfo {
  message: string;
  stack?: string;
  code?: string;
  timestamp: string;
  userId?: string;
  route?: string;
  userAgent?: string;
}

export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errors: ErrorInfo[] = [];

  private constructor() {
    // Setup global error listeners
    this.setupGlobalListeners();
  }

  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  private setupGlobalListeners() {
    // Catch unhandled JavaScript errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError({
          message: event.message,
          stack: event.error?.stack,
          code: 'UNHANDLED_ERROR',
          timestamp: new Date().toISOString(),
          route: window.location.pathname,
          userAgent: navigator.userAgent,
        });
      });

      // Catch unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          message: event.reason?.message || 'Unhandled Promise Rejection',
          stack: event.reason?.stack,
          code: 'UNHANDLED_PROMISE_REJECTION',
          timestamp: new Date().toISOString(),
          route: window.location.pathname,
          userAgent: navigator.userAgent,
        });
      });

      // Catch network errors
      window.addEventListener('offline', () => {
        setTimeout(() => {
          this.handleNetworkError('Connection lost');
        }, 0);
      });

      window.addEventListener('online', () => {
        setTimeout(() => {
          toast({
            title: "Connection restored",
            description: "You're back online!",
            variant: "default",
          });
        }, 0);
      });
    }
  }

  public logError(errorInfo: Partial<ErrorInfo>) {
    const fullErrorInfo: ErrorInfo = {
      message: errorInfo.message || 'Unknown error',
      stack: errorInfo.stack,
      code: errorInfo.code || 'UNKNOWN',
      timestamp: errorInfo.timestamp || new Date().toISOString(),
      userId: errorInfo.userId,
      route: errorInfo.route || (typeof window !== 'undefined' ? window.location.pathname : ''),
      userAgent: errorInfo.userAgent || (typeof window !== 'undefined' ? navigator.userAgent : ''),
    };

    // Store error in memory (you could also send to external service)
    this.errors.push(fullErrorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Global Error:', fullErrorInfo);
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(fullErrorInfo);
    }

    // Show user-friendly notification for critical errors
    if (this.isCriticalError(fullErrorInfo)) {
      this.showUserNotification(fullErrorInfo);
    }
  }

  public handleAsyncError(error: any, context?: string) {
    this.logError({
      message: error?.message || 'Async operation failed',
      stack: error?.stack,
      code: 'ASYNC_ERROR',
      timestamp: new Date().toISOString(),
      route: typeof window !== 'undefined' ? window.location.pathname : '',
    });

    // Show contextual error message - defer to avoid setState during render
    setTimeout(() => {
      toast({
        title: "Something went wrong",
        description: context ? `Failed to ${context}. Please try again.` : "An error occurred. Please try again.",
        variant: "destructive",
      });
    }, 0);
  }

  public handleAPIError(error: any, endpoint?: string) {
    const isNetworkError = !navigator.onLine || error?.code === 'NETWORK_ERROR';
    
    if (isNetworkError) {
      this.handleNetworkError(`API call failed: ${endpoint}`);
      return;
    }

    this.logError({
      message: error?.message || 'API request failed',
      stack: error?.stack,
      code: `API_ERROR_${error?.status || 'UNKNOWN'}`,
      timestamp: new Date().toISOString(),
      route: endpoint,
    });

    // Show appropriate error message based on status - defer to avoid setState during render
    const statusCode = error?.status;
    let message = "Something went wrong. Please try again.";
    
    if (statusCode === 401) {
      message = "Please log in again to continue.";
    } else if (statusCode === 403) {
      message = "You don't have permission to perform this action.";
    } else if (statusCode === 404) {
      message = "The requested resource was not found.";
    } else if (statusCode >= 500) {
      message = "Server error. Our team has been notified.";
    }

    setTimeout(() => {
      toast({
        title: "Request failed",
        description: message,
        variant: "destructive",
      });
    }, 0);
  }

  public handleNetworkError(context?: string) {
    setTimeout(() => {
      toast({
        title: "No internet connection",
        description: context ? `${context}. Please check your connection.` : "Please check your internet connection and try again.",
        variant: "destructive",
      });
    }, 0);

    this.logError({
      message: 'Network error',
      code: 'NETWORK_ERROR',
      timestamp: new Date().toISOString(),
      route: context,
    });
  }

  private isCriticalError(errorInfo: ErrorInfo): boolean {
    const criticalCodes = ['UNHANDLED_ERROR', 'UNHANDLED_PROMISE_REJECTION'];
    return criticalCodes.includes(errorInfo.code || '');
  }

  private showUserNotification(errorInfo: ErrorInfo) {
    // Use setTimeout to defer the toast call to avoid setState during render
    setTimeout(() => {
      toast({
        title: "Unexpected error",
        description: "Something went wrong. The issue has been reported to our team.",
        variant: "destructive",
      });
    }, 0);
  }

  private async sendToErrorService(errorInfo: ErrorInfo) {
    try {
      // Example: Send to error tracking service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorInfo),
      // });
      
      // For now, just log to console in production
      console.error('Error logged:', errorInfo);
    } catch (sendError) {
      console.error('Failed to send error to tracking service:', sendError);
    }
  }

  public getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  public clearErrors(): void {
    this.errors = [];
  }
}

// Export singleton instance
export const globalErrorHandler = GlobalErrorHandler.getInstance();

// Utility function for wrapping async operations
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  context?: string
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      globalErrorHandler.handleAsyncError(error, context);
      throw error; // Re-throw so calling code can handle if needed
    }
  }) as T;
};

// Utility function for API calls
export const apiCall = async <T = any>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    globalErrorHandler.handleAPIError(error, url);
    throw error;
  }
};
