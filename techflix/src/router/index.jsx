import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import BrowsePage from '../pages/BrowsePage';
import SeriesPage from '../pages/SeriesPage';
import TTSTestPage from '../pages/TTSTestPage';

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
        path: 'series/:seriesId',
        element: <SeriesPage />,
      },
      {
        path: 'tts-test',
        element: <TTSTestPage />,
      },
      {
        path: '*',
        element: <Navigate to="/browse" replace />,
      },
    ],
  },
]);

// Route paths constants for type safety
export const ROUTES = {
  HOME: '/',
  BROWSE: '/browse',
  SERIES: (seriesId) => `/series/${seriesId}`,
};