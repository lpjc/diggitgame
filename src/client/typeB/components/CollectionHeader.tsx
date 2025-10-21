// Job: Simple card that shows the username collection title and current level.
// Designed to be placed in a fixed overlay at the center-bottom by the parent.
interface CollectionHeaderProps {
  username: string;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({ username }) => {
  return (
    <div className="inline-block bg-white/70 backdrop-blur-sm rounded-md shadow px-2.5 py-1.5 text-left">
      <h1 className="text-sm font-bold text-gray-800 mb-0.5">
        u/{username} Collection
      </h1>
      <div className="text-xs text-gray-600">
        Level 12
      </div>
    </div>
  );
};
