import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useEpisodeStore } from '../store/episodeStore';
import NetflixEpisodeCard from '@components/NetflixEpisodeCard';
import { ROUTES } from '../router';
import logger from '@utils/logger';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { seasons, setCurrentSeason, setCurrentEpisode } = useEpisodeStore();
  
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const searchResults = useMemo(() => {
    if (!query || query.length < 2) return [];

    const results = [];
    const lowerQuery = query.toLowerCase();

    seasons.forEach((season, seasonIndex) => {
      season.episodes.forEach((episode) => {
        const titleMatch = episode.title.toLowerCase().includes(lowerQuery);
        const descriptionMatch = episode.description?.toLowerCase().includes(lowerQuery);
        const topicsMatch = episode.topics?.some(topic => 
          topic.toLowerCase().includes(lowerQuery)
        );

        if (titleMatch || descriptionMatch || topicsMatch) {
          results.push({
            ...episode,
            seasonNumber: seasonIndex + 1,
            seasonId: season.id,
          });
        }
      });
    });

    logger.info('Search performed', { query, resultsCount: results.length });
    return results;
  }, [query, seasons]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const handleClear = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handleEpisodeClick = (episode) => {
    setCurrentSeason(episode.seasonNumber);
    setCurrentEpisode(episode.id);
    // Navigate to series page with episode info
    navigate(ROUTES.SERIES('tech-insights'));
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search episodes, topics..."
              className="w-full pl-12 pr-12 py-4 bg-zinc-800 text-white rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-netflix-red 
                         placeholder:text-gray-400"
              autoFocus
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 
                           hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {/* Search Results */}
        {query && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              {searchResults.length > 0
                ? `${searchResults.length} result${searchResults.length > 1 ? 's' : ''} for "${query}"`
                : `No results found for "${query}"`}
            </h2>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((episode) => (
              <div key={`${episode.seasonId}-${episode.id}`}>
                <NetflixEpisodeCard
                  episode={episode}
                  episodeNumber={episode.episodeNumber}
                  seasonNumber={episode.seasonNumber}
                  onPlay={() => handleEpisodeClick(episode)}
                />
                <p className="text-sm text-gray-400 mt-2">
                  Season {episode.seasonNumber}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {query && searchResults.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">
              Try searching for different keywords or topics
            </p>
            <button
              onClick={() => navigate(ROUTES.BROWSE)}
              className="text-netflix-red hover:underline"
            >
              Browse all episodes
            </button>
          </div>
        )}

        {/* Initial State */}
        {!query && (
          <div className="text-center py-20">
            <Search className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-4">
              Search for episodes
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Find episodes by title, description, or topics. Try searching for 
              &ldquo;Kafka&rdquo;, &ldquo;metrics&rdquo;, or &ldquo;observability&rdquo;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;