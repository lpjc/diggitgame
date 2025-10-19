interface ControlBannerProps {
  stats: {
    totalFound: number;
    uniqueSubreddits: number;
    firstDiscoveries: number;
    totalBroken: number;
  };
  sortBy: 'date' | 'rarity' | 'subreddit';
  onSortChange: (sort: 'date' | 'rarity' | 'subreddit') => void;
  autoScroll: boolean;
  onAutoScrollToggle: () => void;
}

export const ControlBanner: React.FC<ControlBannerProps> = ({
  stats,
  sortBy,
  onSortChange,
  autoScroll,
  onAutoScrollToggle,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm shadow-[0_-4px_12px_rgba(0,0,0,0.1)] border-t border-gray-200">
      <div className="px-2 py-2">
        {/* Stats Row - Compact */}
        <div className="flex justify-center gap-3 mb-2 text-xs">
          <StatBadge icon="Found" value={stats.totalFound} label="Found" />
          <StatBadge icon="Subs" value={stats.uniqueSubreddits} label="Subs" />
          <StatBadge icon="First" value={stats.firstDiscoveries} label="First" />
          <StatBadge icon="Broken" value={stats.totalBroken} label="Broken" />
        </div>

        {/* Controls Row - Compact */}
        <div className="flex justify-center gap-1 flex-wrap">
          <SortButton
            active={sortBy === 'date'}
            onClick={() => onSortChange('date')}
            icon="Date"
            label="Date"
          />
          <SortButton
            active={sortBy === 'rarity'}
            onClick={() => onSortChange('rarity')}
            icon="Rarity"
            label="Rarity"
          />
          <SortButton
            active={sortBy === 'subreddit'}
            onClick={() => onSortChange('subreddit')}
            icon="Sub"
            label="Sub"
          />
          <ToggleButton
            active={autoScroll}
            onClick={onAutoScrollToggle}
            icon="Scroll"
            label="Scroll"
          />
        </div>
      </div>
    </div>
  );
};

const StatBadge: React.FC<{ icon: string; value: number; label: string }> = ({
  icon,
  value,
  label,
}) => {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm">{icon}</span>
      <div>
        <span className="font-bold text-gray-800">{value}</span>
        <span className="text-gray-600 ml-1">{label}</span>
      </div>
    </div>
  );
};

const SortButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}> = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
        active ? 'bg-purple-500 text-white' : 'bg-white text-gray-700 border border-gray-300'
      }`}
    >
      {icon} {label}
    </button>
  );
};

const ToggleButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}> = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
        active ? 'bg-green-500 text-white' : 'bg-white text-gray-700 border border-gray-300'
      }`}
    >
      {icon} {label}
    </button>
  );
};
