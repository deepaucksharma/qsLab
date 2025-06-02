import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useEpisodeStore } from '../store/episodeStore';
import NetflixEpisodePlayer from '@components/NetflixEpisodePlayer';
import LoadingScreen from '@components/LoadingScreen';
import { ROUTES } from '../router';
import logger from '@utils/logger';

const EpisodePage = () => {
  const { seriesId, seasonId, episodeId } = useParams();
  const navigate = useNavigate();
  const { 
    getEpisode, 
    setCurrentEpisode,
    currentSeason,
    currentEpisode,
    isLoading 
  } = useEpisodeStore();
  
  const [episode, setEpisode] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEpisode = async () => {
      try {
        logger.info('Loading episode', { seriesId, seasonId, episodeId });
        
        const episodeData = await getEpisode(seriesId, seasonId, episodeId);
        
        if (!episodeData) {
          setError('Episode not found');
          logger.error('Episode not found', { seriesId, seasonId, episodeId });
          return;
        }
        
        setEpisode(episodeData);
        setCurrentEpisode(episodeId);
        logger.info('Episode loaded successfully', { episodeId: episodeData.id });
      } catch (err) {
        logger.error('Failed to load episode', err);
        setError('Failed to load episode');
      }
    };

    loadEpisode();
  }, [seriesId, seasonId, episodeId, getEpisode, setCurrentEpisode]);

  const handleClose = () => {
    navigate(`${ROUTES.SERIES}/${seriesId}`);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{error}</h2>
          <button
            onClick={() => navigate(ROUTES.BROWSE)}
            className="px-6 py-3 bg-netflix-red text-white rounded hover:bg-red-700 transition"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  if (!episode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <NetflixEpisodePlayer
        episode={episode}
        seasonNumber={currentSeason}
        onClose={handleClose}
      />
    </div>
  );
};

export default EpisodePage;