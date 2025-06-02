import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import BrowsePage from '../pages/BrowsePage';
import SeriesPage from '../pages/SeriesPage';
import TTSTestPage from '../pages/TTSTestPage';
import NotFoundPage from '../pages/NotFoundPage';
import SearchPage from '../pages/SearchPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/browse" replace />,
      },
      {
        path: 'browse',
        element: <BrowsePage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'series/:seriesId',
        element: <SeriesPage />,
      },
      {
        path: 'tts-test',
        element: <TTSTestPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

// Route paths constants for type safety
export const ROUTES = {
  HOME: '/',
  BROWSE: '/browse',
  SEARCH: '/search',
  SERIES: (seriesId) => `/series/${seriesId}`,
};