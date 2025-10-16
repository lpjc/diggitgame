import { useEffect, useState } from 'react';
import { fetchAPI } from '../../shared/utils/api';
import { GetMuseumResponse } from '../../../shared/types/artifact';
import { ArtifactGrid } from './ArtifactGrid';
import { BrokenArtifactsView } from './BrokenArtifactsView';

interface MuseumProps {
  userId: string;
}

export const Museum: React.FC<MuseumProps> = ({ userId }) => {
  const [museumData, setMuseumData] = useState<GetMuseumResponse | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rarity' | 'subreddit'>('date');
  const [showBroken, setShowBroken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMuseumData();
  }, [userId, sortBy, showBroken]);

  async function fetchMuseumData() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAPI<GetMuseumResponse>(
        `/api/museum/${userId}?sortBy=${sortBy}&includeBroken=${showBroken}`
      );
      setMuseumData(data);
    } catch (err) {
      console.error('Failed to fetch museum:', err);
      setError('Failed to load museum. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🏛️</div>
          <p className="text-xl font-semibold text-gray-700">Loading museum...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl font-semibold text-red-600">{error}</p>
          <button
            onClick={fetchMuseumData}
            className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!museumData) return null;

  const intactArtifacts = museumData.artifacts.filter((a) => !a.isBroken);
  const brokenArtifacts = museumData.artifacts.filter((a) => a.isBroken);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏛️ Your Museum</h1>
          <p className="text-gray-600">Your collection of discovered artifacts</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-3xl font-bold text-green-600">{museumData.stats.totalFound}</div>
            <div className="text-sm text-gray-600 mt-1">Artifacts Found</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-3xl font-bold text-blue-600">
              {museumData.stats.uniqueSubreddits}
            </div>
            <div className="text-sm text-gray-600 mt-1">Subreddits Explored</div>
          </div>
          <div
            className="bg-white rounded-lg p-4 shadow-md text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowBroken(!showBroken)}
          >
            <div className="text-3xl font-bold text-red-600">
              🗑️ {museumData.stats.totalBroken}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {showBroken ? 'Hide Broken' : 'Show Broken'}
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        {!showBroken && (
          <div className="flex justify-center gap-2 mb-6">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'date'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSortBy('date')}
            >
              📅 Sort by Date
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'rarity'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSortBy('rarity')}
            >
              💎 Sort by Rarity
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'subreddit'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSortBy('subreddit')}
            >
              📂 Sort by Subreddit
            </button>
          </div>
        )}

        {/* Artifact Display */}
        {showBroken ? (
          <BrokenArtifactsView artifacts={brokenArtifacts} />
        ) : (
          <ArtifactGrid artifacts={intactArtifacts} />
        )}
      </div>
    </div>
  );
};
