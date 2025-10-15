import { navigateTo } from '@devvit/web/client';
import { useCounter } from '../hooks/useCounter';
import { useEffect, useState } from 'react';
import { fetchAPI } from '../shared/utils/api';
import { InitResponse, DataFeedResponse } from '../../shared/types/api';

export const App = () => {
  console.log('🟣 TYPE B APP LOADED');
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
    <div className="flex relative flex-col justify-center items-center min-h-screen gap-4 bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
        Type B {postType && `(${postType})`}
      </div>
      <img className="object-contain w-1/2 max-w-[250px] mx-auto" src="/snoo.png" alt="Snoo" />
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold text-center text-purple-900 ">
          {username ? `Welcome ${username}! 🎮` : ''}
        </h1>
        <p className="text-base text-center text-purple-700 ">
          This is Type B Post - Advanced game mode
        </p>
      </div>
      <div className="flex items-center justify-center mt-5">
        <button
          className="flex items-center justify-center bg-purple-600 text-white w-14 h-14 text-[2.5em] rounded-full cursor-pointer font-mono leading-none transition-colors hover:bg-purple-700"
          onClick={decrement}
          disabled={loading}
        >
          -
        </button>
        <span className="text-[1.8em] font-medium mx-5 min-w-[50px] text-center leading-none text-purple-900">
          {loading ? '...' : count}
        </span>
        <button
          className="flex items-center justify-center bg-purple-600 text-white w-14 h-14 text-[2.5em] rounded-full cursor-pointer font-mono leading-none transition-colors hover:bg-purple-700"
          onClick={increment}
          disabled={loading}
        >
          +
        </button>
      </div>

      {!feedLoading && dataFeed && (
        <div className="mt-6 w-full max-w-md bg-white/80 backdrop-blur rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-purple-900">Community Data</h2>
          <p className="text-sm text-purple-700">
            r/{dataFeed.subredditInfo.name} - {dataFeed.subredditInfo.subscribers} subscribers
          </p>
          {dataFeed.userData && (
            <p className="text-sm text-purple-700 mt-1">Your karma: {dataFeed.userData.karma}</p>
          )}
          <div className="mt-3">
            <h3 className="text-sm font-semibold text-purple-900 mb-1">Hot Posts:</h3>
            <div className="space-y-1">
              {dataFeed.posts.slice(0, 3).map((post) => (
                <div key={post.id} className="text-xs text-purple-600">
                  {post.title.substring(0, 40)}...
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 text-[0.8em] text-purple-600">
        <button
          className="cursor-pointer"
          onClick={() => navigateTo('https://developers.reddit.com/docs')}
        >
          Docs
        </button>
        <span className="text-purple-300">|</span>
        <button
          className="cursor-pointer"
          onClick={() => navigateTo('https://www.reddit.com/r/Devvit')}
        >
          r/Devvit
        </button>
        <span className="text-purple-300">|</span>
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
