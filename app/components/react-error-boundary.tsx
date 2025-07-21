import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { motion } from 'framer-motion';
import { globalErrorHandler } from '~/utils/error-handler';
import iconImage from '~/assets/bashers.png';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
}

export class ReactErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: new Date().toISOString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to global handler
    globalErrorHandler.logError({
      message: error.message,
      stack: error.stack,
      code: 'REACT_ERROR_BOUNDARY',
      timestamp: new Date().toISOString(),
    });

    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-800 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-lg w-full text-center border border-red-500/20"
          >
            <img
              src={iconImage}
              alt="Byte Bash Logo"
              className="w-16 h-16 mx-auto mb-4 opacity-50"
            />
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Bug className="w-16 h-16 text-red-400 mx-auto mb-4" />
            </motion.div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Component Error
            </h1>
            
            <p className="text-gray-400 mb-4">
              A component encountered an error and couldn't render properly.
            </p>

            {this.state.errorId && (
              <div className="text-xs text-gray-500 mb-6 font-mono">
                Error ID: {this.state.errorId}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleReload}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </motion.button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-4 bg-black/50 rounded-lg text-xs font-mono overflow-auto max-h-40">
                  <div className="text-red-400 mb-2">Error:</div>
                  <div className="text-gray-300 mb-4">{this.state.error.message}</div>
                  
                  {this.state.error.stack && (
                    <>
                      <div className="text-red-400 mb-2">Stack Trace:</div>
                      <div className="text-gray-400 whitespace-pre-wrap text-xs">
                        {this.state.error.stack}
                      </div>
                    </>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <>
                      <div className="text-red-400 mb-2 mt-4">Component Stack:</div>
                      <div className="text-gray-400 whitespace-pre-wrap text-xs">
                        {this.state.errorInfo.componentStack}
                      </div>
                    </>
                  )}
                </div>
              </details>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for easier usage
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  fallback,
  onError,
}) => {
  return (
    <ReactErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ReactErrorBoundary>
  );
};
