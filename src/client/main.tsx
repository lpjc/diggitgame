import './index.css';

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App as TypeAApp } from './typeA/App';
import { App as TypeBApp } from './typeB/App';

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
    return <div>Loading...</div>;
  }

  return postType === 'typeB' ? <TypeBApp /> : <TypeAApp />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);
