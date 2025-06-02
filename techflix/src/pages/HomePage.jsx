import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../router';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to browse page
    navigate(ROUTES.BROWSE, { replace: true });
  }, [navigate]);

  return null;
};

export default HomePage;