import { useEffect, useState } from 'react';
import { fetchAPI } from '../shared/utils/api';
import { InitResponse } from '../../shared/types/api';
import { Museum } from './components/Museum';

export const App = () => {
  console.log('🟣 TYPE B - MUSEUM APP LOADED');
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const initData = await fetchAPI<InitResponse>('/api/init');
        setUserId(initData.username || 'anonymous');
      } catch (error) {
        console.error('Failed to fetch init data:', error);
        setUserId('anonymous');
      } finally {
        setLoading(false);
      }
    };

    fetchInitData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🏛️</div>
          <p className="text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return <Museum userId={userId} />;
};
