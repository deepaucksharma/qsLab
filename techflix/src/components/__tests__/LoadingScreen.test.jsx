import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingScreen from '../LoadingScreen';

describe('LoadingScreen', () => {
  it('renders loading screen with default elements', () => {
    render(<LoadingScreen />);
    
    // Check for TechFlix logo
    expect(screen.getByText('TechFlix')).toBeInTheDocument();
    
    // Check for loading message
    expect(screen.getByText(/Loading your technical journey/i)).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    const { container } = render(<LoadingScreen />);
    const loadingScreen = container.firstChild;
    
    expect(loadingScreen).toHaveClass('fixed', 'inset-0', 'bg-black', 'z-50');
  });

  it('renders with animation classes', () => {
    const { container } = render(<LoadingScreen />);
    const logo = screen.getByText('TechFlix');
    
    expect(logo.parentElement).toHaveClass('animate-pulse');
  });

  it('displays loading dots animation', () => {
    render(<LoadingScreen />);
    const loadingDots = screen.getAllByRole('presentation');
    
    expect(loadingDots.length).toBeGreaterThan(0);
    loadingDots.forEach(dot => {
      expect(dot).toHaveClass('bg-netflix-red');
    });
  });
});