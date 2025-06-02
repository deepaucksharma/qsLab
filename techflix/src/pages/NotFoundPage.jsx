import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { ROUTES } from '../router';

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Log 404 error
    if (window.errorTracker) {
      window.errorTracker.captureMessage('404 Page Not Found', {
        level: 'warning',
        extra: {
          url: window.location.href,
          referrer: document.referrer
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-netflix-red mb-4 animate-pulse">
            404
          </h1>
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-3 h-3 bg-netflix-red rounded-full animate-bounce" 
                 style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-netflix-red rounded-full animate-bounce" 
                 style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-netflix-red rounded-full animate-bounce" 
                 style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl font-bold text-white mb-4">
          Lost in the Stream
        </h2>
        <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto">
          The content you're looking for seems to have wandered off. 
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => navigate(ROUTES.BROWSE)}
            className="px-6 py-3 bg-netflix-red text-white rounded-lg hover:bg-red-700 
                     transition duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <Home className="w-5 h-5" />
            Back to Browse
          </button>
          
          <button
            onClick={() => navigate(ROUTES.SEARCH)}
            className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 
                     transition duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <Search className="w-5 h-5" />
            Search Content
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-transparent text-white border border-zinc-700 
                     rounded-lg hover:bg-zinc-900 transition duration-200 
                     flex items-center justify-center gap-2 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Suggestions */}
        <div className="border-t border-zinc-800 pt-8">
          <p className="text-gray-500 mb-4">Popular destinations:</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate(`${ROUTES.SERIES}/techflix`)}
              className="text-netflix-red hover:underline"
            >
              Tech Insights Series
            </button>
            <span className="text-gray-600">•</span>
            <button
              onClick={() => navigate(ROUTES.BROWSE)}
              className="text-netflix-red hover:underline"
            >
              All Episodes
            </button>
            <span className="text-gray-600">•</span>
            <button
              onClick={() => navigate(`${ROUTES.SEARCH}?q=kafka`)}
              className="text-netflix-red hover:underline"
            >
              Kafka Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;