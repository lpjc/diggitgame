import './index.css';

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App as TypeAApp } from './typeA/App';
import { App as TypeBApp } from './typeB/App';

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-lg font-medium text-gray-700">Loading game...</p>
    </div>
  </div>
);

const AppRouter = () => {
  const [postType, setPostType] = useState<'typeA' | 'typeB' | null>(null);

  useEffect(() => {
    // Fetch post type from API
    fetch('/api/init')
      .then((res) => res.json())
      .then((data) => {
        console.log('Post type from API:', data.postType);
        setPostType(data.postType);
      })
      .catch((err) => {
        console.error('Failed to fetch post type:', err);
        setPostType('typeA'); // Default fallback
      });
  }, []);

  if (!postType) {
    return <LoadingScreen />;
  }

  return postType === 'typeB' ? <TypeBApp /> : <TypeAApp />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);
