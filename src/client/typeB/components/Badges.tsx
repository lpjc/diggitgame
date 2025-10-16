import { RarityTier } from '../../../shared/types/artifact';

interface RarityBadgeProps {
  tier: RarityTier;
}

export const RarityBadge: React.FC<RarityBadgeProps> = ({ tier }) => {
  const config = {
    unique: { icon: '⭐', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
    ultra_rare: { icon: '💎', color: 'bg-gradient-to-r from-purple-400 to-pink-500' },
    rare: { icon: '🔷', color: 'bg-gradient-to-r from-blue-400 to-cyan-500' },
    uncommon: { icon: '🔹', color: 'bg-gradient-to-r from-green-400 to-emerald-500' },
    common: { icon: '⚪', color: 'bg-gradient-to-r from-gray-300 to-gray-400' },
  };

  const { icon, color } = config[tier];

  return <div className={`${color} text-white text-xs px-1 py-0.5 rounded shadow`}>{icon}</div>;
};

interface SubredditBadgeProps {
  subreddit: string;
}

export const SubredditBadge: React.FC<SubredditBadgeProps> = ({ subreddit }) => {
  return (
    <span className="text-xs text-blue-600 font-medium">r/{subreddit}</span>
  );
};

export const FirstDiscoveryBadge: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs px-1 py-0.5 rounded shadow animate-pulse">
      🏆
    </div>
  );
};
