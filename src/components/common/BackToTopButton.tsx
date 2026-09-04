import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className="fixed bottom-6 right-6 z-40 p-3 bg-amber-400 hover:bg-amber-300 dark:bg-amber-400 dark:hover:bg-amber-300 text-slate-950 rounded-2xl shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500"
    >
      <ArrowUp className="w-5 h-5 font-bold" />
    </button>
  );
};
