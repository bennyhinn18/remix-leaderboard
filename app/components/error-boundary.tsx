import { Link, useRouteError, isRouteErrorResponse } from '@remix-run/react';
import { AlertCircle, Home, RefreshCw, Bug, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import iconImage from '~/assets/bashers.png';

interface ErrorDetails {
  message: string;
  stack?: string;
  code?: string;
  timestamp: string;
}

// Global error logger
const logError = (error: any, errorInfo?: any) => {
  const errorDetails: ErrorDetails = {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    code: error?.code || 'UNKNOWN',
    timestamp: new Date().toISOString(),
  };

  // Log to console for development
  console.error('🚨 Global Error Caught:', errorDetails);
  
  // In production, you could send this to an error tracking service
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Example: Send to error tracking service
    // sendToErrorService(errorDetails);
  }

  return errorDetails;
};

export function ErrorBoundary() {
  const error = useRouteError();
  const [showDetails, setShowDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);

  useEffect(() => {
    const details = logError(error);
    setErrorDetails(details);
  }, [error]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  // Handle route errors (404, 500, etc.)
  if (isRouteErrorResponse(error)) {
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
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-2">
            {error.status === 404 ? 'Page Not Found' : `Error ${error.status}`}
          </h1>
          
          <p className="text-gray-400 mb-6">
            {error.status === 404
              ? "The page you're looking for doesn't exist or has been moved."
              : error.data || 'An unexpected error occurred while processing your request.'}
          </p>

          {error.status === 404 && (
            <div className="text-sm text-gray-500 mb-6">
              Error ID: {errorDetails?.timestamp}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoBack}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </motion.button>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/leaderboard"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              >
                Leaderboard
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Handle JavaScript/React errors
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-2xl w-full text-center border border-red-500/20"
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

        <h1 className="text-3xl font-bold text-white mb-2">
          Something went wrong
        </h1>
        
        <p className="text-gray-400 mb-6">
          An unexpected error occurred. Our team has been notified and is working on a fix.
        </p>

        {errorDetails && (
          <div className="text-sm text-gray-500 mb-6">
            Error ID: {errorDetails.timestamp}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </motion.button>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </motion.div>
        </div>

        {/* Error Details Toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
        >
          {showDetails ? 'Hide' : 'Show'} Error Details
        </motion.button>

        {showDetails && errorDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-black/50 rounded-lg text-left text-xs font-mono overflow-auto max-h-40"
          >
            <div className="text-red-400 mb-2">Error Message:</div>
            <div className="text-gray-300 mb-4">{errorDetails.message}</div>
            
            {errorDetails.stack && (
              <>
                <div className="text-red-400 mb-2">Stack Trace:</div>
                <div className="text-gray-400 whitespace-pre-wrap">
                  {errorDetails.stack}
                </div>
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
