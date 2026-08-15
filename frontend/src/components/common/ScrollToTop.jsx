import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const SCROLL_VISIBILITY_THRESHOLD = 300;

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(window.scrollY > SCROLL_VISIBILITY_THRESHOLD);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="scroll-to-top"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
