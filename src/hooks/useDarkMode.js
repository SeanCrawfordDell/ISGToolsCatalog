import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check for saved preference or system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update DOM and localStorage when state changes
    const root = document.documentElement;
    const html = document.querySelector('html');
    
    if (isDark) {
      root.classList.add('dark');
      html.classList.add('dark');
      console.log('Dark mode enabled');
    } else {
      root.classList.remove('dark');
      html.classList.remove('dark');
      console.log('Dark mode disabled');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }, [isDark]);

  const toggle = () => {
    console.log('Toggle clicked, current state:', isDark);
    setIsDark(!isDark);
  };

  return { isDark, toggle };
};