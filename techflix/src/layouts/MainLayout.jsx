import { Outlet } from 'react-router-dom';
import Header from '@components/Header';
import { useState, useEffect } from 'react';

const MainLayout = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header scrolled={scrolled} />
      <main className="relative">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;