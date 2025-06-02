import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import logger from '@utils/logger';

const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  // Log the error
  logger.error('Route error boundary triggered', {
    error: error?.message || 'Unknown error',
    status: error?.status,
    statusText: error?.statusText,
    stack: error?.stack
  });

  const is404 = error?.status === 404;
  const isDevelopment = import.meta.env.DEV;

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <AlertTriangle className="w-20 h-20 text-netflix-red mx-auto mb-4" />
          
          <h1 className="text-4xl font-bold text-white mb-2">
            {is404 ? 'Page Not Found' : 'Something went wrong'}
          </h1>
          
          <p className="text-xl text-gray-400">
            {is404 
              ? "The page you're looking for doesn't exist."
              : "We encountered an unexpected error."}
          </p>
        </div>

        {isDevelopment && error && !is404 && (
          <div className="mb-8 p-4 bg-zinc-900 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Error Details:</h3>
            <pre className="text-xs text-red-400 overflow-auto max-h-40">
              {error.stack || error.message || JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-netflix-red text-white rounded-lg hover:bg-red-700 
                     transition duration-200 flex items-center gap-2 font-medium"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </button>
          
          {!is404 && (
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 
                       transition duration-200 flex items-center gap-2 font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Page
            </button>
          )}
        </div>

        {is404 && (
          <div className="mt-12">
            <p className="text-gray-500 mb-4">Here are some helpful links:</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => navigate('/browse')}
                className="text-netflix-red hover:underline"
              >
                Browse Episodes
              </button>
              <button
                onClick={() => navigate('/search')}
                className="text-netflix-red hover:underline"
              >
                Search Content
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteErrorBoundary;