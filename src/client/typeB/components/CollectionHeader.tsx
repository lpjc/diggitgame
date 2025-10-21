// Job: Simple card that shows the username collection title, key collection
// stats, and a placeholder level. Designed to be placed in a fixed overlay at
// the center-bottom by the parent.
interface CollectionHeaderProps {
  username: string;
  stats: {
    totalFound: number;
    totalBroken: number;
    uniqueSubreddits: number;
    firstDiscoveries: number;
  };
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({ username, stats }) => {
  return (
    <div className="inline-block bg-white/70 backdrop-blur-sm rounded-md shadow px-2.5 py-1.5 text-left">
      <h1 className="text-sm font-bold text-gray-800 mb-0.5">
        The u/{username} Collection
      </h1>
      <div className="mt-1 text-[12px] text-gray-500">Level 12</div>      {/* Placeholder level until progression is implemented */}
      {/* Stats row */}
      <div className="mt-1 grid grid-cols-2 gap-2 text-[12px] text-gray-700">
        <div className="flex items-center gap-1"><span>🏺</span><span className="font-semibold">{stats.totalFound}</span><span>Found</span></div>
        <div className="flex items-center gap-1"><span>r/</span><span className="font-semibold">{stats.uniqueSubreddits}</span><span>Subs</span></div>
        <div className="flex items-center gap-1"><span>✨</span><span className="font-semibold">{stats.firstDiscoveries}</span><span>First</span></div>
        <div className="flex items-center gap-1"><span>🗑️</span><span className="font-semibold">{stats.totalBroken}</span><span>Broken</span></div>
      </div>

     
    </div>
  );
};
