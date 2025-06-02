import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import logger from '@utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    logger.error('ErrorBoundary caught error', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      props: this.props
    });

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Send to error tracking service (e.g., Sentry, LogRocket)
    if (window.errorTracker) {
      window.errorTracker.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-zinc-900 rounded-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-netflix-red mx-auto mb-4" />
            
            <h1 className="text-3xl font-bold text-white mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-400 mb-6">
              We're sorry, but something unexpected happened. 
              {this.state.errorCount > 2 && (
                <span className="block mt-2 text-yellow-500">
                  This error has occurred multiple times. Please refresh the page.
                </span>
              )}
            </p>

            {isDevelopment && this.state.error && (
              <div className="text-left mb-6 p-4 bg-black rounded overflow-auto max-h-64">
                <p className="text-red-500 font-mono text-sm mb-2">
                  {this.state.error.toString()}
                </p>
                <pre className="text-gray-500 font-mono text-xs whitespace-pre-wrap">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-netflix-red text-white rounded hover:bg-red-700 
                         transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-zinc-800 text-white rounded hover:bg-zinc-700 
                         transition flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;