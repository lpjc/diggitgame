// Job: Compact floating banner that shows the username collection title.
// Designed to be placed in a fixed overlay at the top-center by the parent.
interface CollectionHeaderProps {
  username: string;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({ username }) => {
  return (
    <div className="rounded-full px-4 py-2 bg-white/85 backdrop-blur border border-amber-600 shadow-lg">
      <h1 className="text-sm font-bold text-amber-900">
        The u/{username} Collection
      </h1>
    </div>
  );
};
