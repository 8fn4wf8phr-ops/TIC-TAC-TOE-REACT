import { useState, useEffect } from 'react';

// Persists light/dark mode to localStorage and applies it as
// data-theme="dark" on <html>, matching the other projects.
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('ttt-react-theme');
      if (saved) return saved;
    } catch {
      /* ignore */
    }
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('ttt-react-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  return { theme, toggleTheme };
}
