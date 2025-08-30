import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ErrorToastContainer, type ErrorToastProps, type ToastVariant } from '~/components/error-toast';
import { globalErrorHandler } from '~/utils/error-handler';

interface ErrorContextType {
  showError: (title: string, description?: string, variant?: ToastVariant) => void;
  showNetworkError: (message?: string) => void;
  showAPIError: (error: any, context?: string) => void;
  dismissError: (id: string) => void;
  clearAllErrors: () => void;
  errors: ErrorToastProps[];
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: React.ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorToastProps[]>([]);

  const generateId = () => `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const showError = useCallback((
    title: string, 
    description?: string, 
    variant: ToastVariant = 'error'
  ) => {
    const id = generateId();
    const newError: ErrorToastProps = {
      id,
      title,
      description,
      variant,
      onDismiss: dismissError,
    };

    setErrors(prev => [...prev, newError]);

    // Log to global error handler
    globalErrorHandler.logError({
      message: `${title}${description ? ': ' + description : ''}`,
      code: `TOAST_${variant.toUpperCase()}`,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const showNetworkError = useCallback((message?: string) => {
    const title = "Connection Issue";
    const description = message || "Please check your internet connection and try again.";
    
    // Check if we already have a network error showing
    const hasNetworkError = errors.some(error => error.variant === 'network');
    if (hasNetworkError) return;

    showError(title, description, 'network');
  }, [errors, showError]);

  const showAPIError = useCallback((error: any, context?: string) => {
    let title = "Request Failed";
    let description = "Something went wrong. Please try again.";
    let variant: ToastVariant = 'error';

    // Handle different types of API errors
    if (error?.status) {
      switch (error.status) {
        case 401:
          title = "Authentication Required";
          description = "Please log in to continue.";
          break;
        case 403:
          title = "Access Denied";
          description = "You don't have permission for this action.";
          break;
        case 404:
          title = "Not Found";
          description = context ? `${context} not found.` : "The requested resource was not found.";
          break;
        case 429:
          title = "Too Many Requests";
          description = "Please wait a moment before trying again.";
          variant = 'warning';
          break;
        case 500:
        case 502:
        case 503:
          title = "Server Error";
          description = "Our team has been notified. Please try again later.";
          break;
        default:
          if (context) {
            title = `Failed to ${context}`;
          }
      }
    } else if (error?.message) {
      description = error.message;
    }

    showError(title, description, variant);
  }, [showError]);

  const dismissError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Listen to online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setTimeout(() => {
        showError("Connection Restored", "You're back online!", 'success');
      }, 0);
    };

    const handleOffline = () => {
      setTimeout(() => {
        showNetworkError("You're currently offline");
      }, 0);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showError, showNetworkError]);

  // Auto-dismiss errors after a certain amount
  useEffect(() => {
    if (errors.length > 5) {
      const oldestError = errors[0];
      setTimeout(() => dismissError(oldestError.id), 100);
    }
  }, [errors, dismissError]);

  const value: ErrorContextType = {
    showError,
    showNetworkError,
    showAPIError,
    dismissError,
    clearAllErrors,
    errors,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ErrorToastContainer toasts={errors} onDismiss={dismissError} />
    </ErrorContext.Provider>
  );
};

// Custom hook for API calls with error handling
export const useAPICall = () => {
  const { showAPIError, showNetworkError } = useError();

  const apiCall = useCallback(async <T = any>(
    url: string,
    options?: RequestInit
  ): Promise<T> => {
    try {
      if (!navigator.onLine) {
        showNetworkError();
        throw new Error('No internet connection');
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        showNetworkError();
      } else {
        showAPIError(error, `request to ${url}`);
      }
      throw error;
    }
  }, [showAPIError, showNetworkError]);

  return { apiCall };
};
