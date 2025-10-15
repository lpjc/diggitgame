import { navigateTo } from '@devvit/web/client';
import { useCounter } from '../hooks/useCounter';
import { useEffect, useState } from 'react';
import { fetchAPI } from '../shared/utils/api';
import { InitResponse, DataFeedResponse } from '../../shared/types/api';

export const App = () => {
  console.log('🔵 TYPE A APP LOADED');
  const { count, username, loading, increment, decrement } = useCounter();
  const [postType, setPostType] = useState<string>('');
  const [dataFeed, setDataFeed] = useState<DataFeedResponse | null>(null);
  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const initData = await fetchAPI<InitResponse>('/api/init');
        setPostType(initData.postType);
      } catch (error) {
        console.error('Failed to fetch init data:', error);
      }
    };

    const fetchDataFeed = async () => {
      try {
        const feed = await fetchAPI<DataFeedResponse>('/api/data-feed');
        setDataFeed(feed);
      } catch (error) {
        console.error('Failed to fetch data feed:', error);
      } finally {
        setFeedLoading(false);
      }
    };

    fetchInitData();
    fetchDataFeed();
  }, []);

  return (
    <div className="flex relative flex-col justify-center items-center min-h-screen gap-4 p-4">
      <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
        Type A {postType && `(${postType})`}
      </div>
      <img className="object-contain w-1/2 max-w-[250px] mx-auto" src="/snoo.png" alt="Snoo" />
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-center text-gray-900 ">
          {username ? `Hey ${username} 👋` : ''}
        </h1>
        <p className="text-base text-center text-gray-600 ">
          This is Type A Post - Classic game mode
        </p>
      </div>
      <div className="flex items-center justify-center mt-5">
        <button
          className="flex items-center justify-center bg-[#d93900] text-white w-14 h-14 text-[2.5em] rounded-full cursor-pointer font-mono leading-none transition-colors hover:bg-[#c03300]"
          onClick={decrement}
          disabled={loading}
        >
          -
        </button>
        <span className="text-[1.8em] font-medium mx-5 min-w-[50px] text-center leading-none text-gray-900">
          {loading ? '...' : count}
        </span>
        <button
          className="flex items-center justify-center bg-[#d93900] text-white w-14 h-14 text-[2.5em] rounded-full cursor-pointer font-mono leading-none transition-colors hover:bg-[#c03300]"
          onClick={increment}
          disabled={loading}
        >
          +
        </button>
      </div>

      {!feedLoading && dataFeed && (
        <div className="mt-6 w-full max-w-md bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Subreddit Info</h2>
          <p className="text-sm text-gray-600">
            r/{dataFeed.subredditInfo.name} - {dataFeed.subredditInfo.subscribers} subscribers
          </p>
          {dataFeed.userData && (
            <p className="text-sm text-gray-600 mt-1">Your karma: {dataFeed.userData.karma}</p>
          )}
        </div>
      )}

      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 text-[0.8em] text-gray-600">
        <button
          className="cursor-pointer"
          onClick={() => navigateTo('https://developers.reddit.com/docs')}
        >
          Docs
        </button>
        <span className="text-gray-300">|</span>
        <button
          className="cursor-pointer"
          onClick={() => navigateTo('https://www.reddit.com/r/Devvit')}
        >
          r/Devvit
        </button>
        <span className="text-gray-300">|</span>
        <button
          className="cursor-pointer"
          onClick={() => navigateTo('https://discord.com/invite/R7yu2wh9Qz')}
        >
          Discord
        </button>
      </footer>
    </div>
  );
};
