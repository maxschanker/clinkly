let isUserScrolling = false;
let scrollTimeout: NodeJS.Timeout | null = null;

// Track user scroll activity to prevent interrupting active scrolling
export const trackUserScrolling = () => {
  if (typeof window === 'undefined') return;
  
  const handleScroll = () => {
    isUserScrolling = true;
    
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(() => {
      isUserScrolling = false;
    }, 150);
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  };
};

// Debounced scroll to top that respects user scrolling
export const scrollToTop = () => {
  if (typeof window === 'undefined') return;
  
  // Don't interrupt if user is actively scrolling
  if (isUserScrolling) {
    return;
  }
  
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
};

// Smart scroll that checks if already at top
export const smartScrollToTop = () => {
  if (typeof window === 'undefined') return;
  
  // Only scroll if not already at top and user isn't scrolling
  if (window.scrollY > 50 && !isUserScrolling) {
    scrollToTop();
  }
};