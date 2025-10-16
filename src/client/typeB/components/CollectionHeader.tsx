interface CollectionHeaderProps {
  username: string;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({ username }) => {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-600 shadow">
      <div className="max-w-full px-2 py-2">
        <h1 className="text-lg font-bold text-center text-amber-900">
          The u/{username} Collection
        </h1>
      </div>
    </div>
  );
};
