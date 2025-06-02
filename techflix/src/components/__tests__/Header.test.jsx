import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderHeader = (props = {}) => {
  return render(
    <BrowserRouter>
      <Header {...props} />
    </BrowserRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the TechFlix logo', () => {
    renderHeader();
    expect(screen.getByText('TechFlix')).toBeInTheDocument();
  });

  it('shows browse link', () => {
    renderHeader();
    expect(screen.getByText('Browse')).toBeInTheDocument();
  });

  it('renders search button', () => {
    renderHeader();
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeInTheDocument();
  });

  it('navigates to search page when search is clicked', () => {
    renderHeader();
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    expect(mockNavigate).toHaveBeenCalledWith('/search');
  });

  it('applies scrolled class when scrolled', () => {
    const { container } = renderHeader({ scrolled: true });
    const header = container.firstChild;
    expect(header).toHaveClass('bg-opacity-90');
  });

  it('does not apply scrolled class when not scrolled', () => {
    const { container } = renderHeader({ scrolled: false });
    const header = container.firstChild;
    expect(header).toHaveClass('bg-opacity-0');
  });

  it('renders navigation links', () => {
    renderHeader();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('My List')).toBeInTheDocument();
  });
});