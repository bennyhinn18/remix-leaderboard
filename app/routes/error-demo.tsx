import { useState } from 'react';
import { useError } from '~/contexts/error-context';
import { ReactErrorBoundary } from '~/components/react-error-boundary';
import { Button } from '~/components/ui/button';
import { AlertTriangle, Bug, Wifi, WifiOff, Zap } from 'lucide-react';

export default function ErrorDemo() {
  const { showError, showNetworkError, showAPIError } = useError();
  const [componentError, setComponentError] = useState(false);

  // Component that throws an error for testing
  const ErrorComponent = () => {
    if (componentError) {
      throw new Error('This is a test React component error!');
    }
    return <div>Component rendered successfully</div>;
  };

  const triggerError = () => {
    showError('Test Error', 'This is a test error message to demonstrate the error handling system.');
  };

  const triggerWarning = () => {
    showError('Warning Message', 'This is a test warning message.', 'warning');
  };

  const triggerNetworkError = () => {
    showNetworkError('Failed to connect to server');
  };

  const triggerAPIError = () => {
    const mockError = {
      status: 500,
      message: 'Internal Server Error'
    };
    showAPIError(mockError, 'fetch user data');
  };

  const triggerComponentError = () => {
    setComponentError(true);
  };

  const triggerGlobalError = () => {
    // This will be caught by the global error handler
    setTimeout(() => {
      throw new Error('Global unhandled error for testing!');
    }, 100);
  };

  const triggerPromiseRejection = () => {
    // This will be caught by the unhandled rejection handler
    Promise.reject(new Error('Unhandled promise rejection for testing!'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🚨 Error Handling Demo
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Toast Errors */}
          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Toast Errors
            </h2>
            <div className="space-y-3">
              <Button onClick={triggerError} variant="destructive" className="w-full">
                Show Error Toast
              </Button>
              <Button onClick={triggerWarning} className="w-full bg-yellow-600 hover:bg-yellow-700">
                Show Warning Toast
              </Button>
              <Button onClick={triggerNetworkError} className="w-full bg-orange-600 hover:bg-orange-700">
                <WifiOff className="w-4 h-4 mr-2" />
                Network Error
              </Button>
              <Button onClick={triggerAPIError} className="w-full bg-purple-600 hover:bg-purple-700">
                API Error (500)
              </Button>
            </div>
          </div>

          {/* Component Errors */}
          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bug className="w-5 h-5 text-blue-400" />
              Component Errors
            </h2>
            <div className="space-y-3">
              <ReactErrorBoundary>
                <ErrorComponent />
              </ReactErrorBoundary>
              <Button onClick={triggerComponentError} variant="destructive" className="w-full">
                Trigger Component Error
              </Button>
              <Button 
                onClick={() => setComponentError(false)} 
                variant="outline" 
                className="w-full"
              >
                Reset Component
              </Button>
            </div>
          </div>

          {/* Global Errors */}
          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Global Errors
            </h2>
            <div className="space-y-3">
              <Button onClick={triggerGlobalError} variant="destructive" className="w-full">
                Global Error
              </Button>
              <Button onClick={triggerPromiseRejection} variant="destructive" className="w-full">
                Promise Rejection
              </Button>
              <p className="text-xs text-gray-400">
                These errors will be caught by the global error handler and logged to console.
              </p>
            </div>
          </div>
        </div>

        {/* Error Handling Features */}
        <div className="mt-12 bg-white/10 rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Error Handling Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-400">Implemented Features</h3>
              <ul className="space-y-2 text-gray-300">
                <li>✅ Global error boundary for React errors</li>
                <li>✅ Global error handler for unhandled errors</li>
                <li>✅ Network error detection</li>
                <li>✅ API error handling with status codes</li>
                <li>✅ Toast notifications for user feedback</li>
                <li>✅ Error logging and reporting</li>
                <li>✅ Retry mechanisms</li>
                <li>✅ Graceful fallback UI</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-400">Error Types Handled</h3>
              <ul className="space-y-2 text-gray-300">
                <li>🚨 React component errors</li>
                <li>🌐 Network connectivity issues</li>
                <li>🔌 API request failures</li>
                <li>⚡ Unhandled JavaScript errors</li>
                <li>🤝 Promise rejections</li>
                <li>📱 Mobile/responsive errors</li>
                <li>🔄 Async operation failures</li>
                <li>🎯 Route-level errors (404, 500, etc.)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <a href="/">← Back to Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
