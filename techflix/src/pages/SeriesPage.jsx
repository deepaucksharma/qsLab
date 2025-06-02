import { useParams, useNavigate } from 'react-router-dom';
import { useEpisodeStore } from '../store/episodeStore';
import { ROUTES } from '../router';
import HeroSection from '@components/HeroSection';
import EnhancedEpisodesSectionFixed from '@components/EnhancedEpisodesSectionFixed';
import SeriesDetails from '@components/SeriesDetails';

const SeriesPage = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { seasons } = useEpisodeStore();

  // For now, we only have one series
  if (seriesId !== 'tech-insights') {
    navigate(ROUTES.NOT_FOUND, { replace: true });
    return null;
  }

  return (
    <>
      <HeroSection />
      <EnhancedEpisodesSectionFixed />
      <SeriesDetails />
    </>
  );
};

export default SeriesPage;