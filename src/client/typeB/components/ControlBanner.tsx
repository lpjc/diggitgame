// Job: Floating bottom-right mini menu with left-expanding dropdowns for
// sorting (field + direction), stats view, and a Gift Shop button that triggers
// a toast handled by the parent. Designed as an overlay; compact and touch
// friendly.
import { useEffect, useRef, useState } from 'react';
interface ControlBannerProps {
  stats: {
    totalFound: number;
    uniqueSubreddits: number;
    firstDiscoveries: number;
    totalBroken: number;
  };
  sortBy: 'date' | 'rarity' | 'subreddit';
  sortDir: 'asc' | 'desc';
  onSortChange: (sort: 'date' | 'rarity' | 'subreddit') => void;
  onSortDirChange: (dir: 'asc' | 'desc') => void;
  autoScroll: boolean;
  onAutoScrollToggle: () => void;
  onGiftShop: () => void;
}

export const ControlBanner: React.FC<ControlBannerProps> = ({
  stats,
  sortBy,
  sortDir,
  onSortChange,
  onSortDirChange,
  autoScroll,
  onAutoScrollToggle,
  onGiftShop,
}) => {
  return (
    <div className="relative">
      <div className="flex flex-col items-end gap-2">
        {/* Mini-menu: vertical stack */}
        <LeftExpandingMenu
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={onSortChange}
          onSortDirChange={onSortDirChange}
          stats={stats}
          autoScroll={autoScroll}
          onAutoScrollToggle={onAutoScrollToggle}
          onGiftShop={onGiftShop}
        />
      </div>
    </div>
  );
};

const StatBadge: React.FC<{ icon: string; value: number; label: string }> = ({ icon, value, label }) => (
  <div className="flex items-center gap-1">
    <span className="text-sm">{icon}</span>
    <div>
      <span className="font-bold text-gray-800">{value}</span>
      <span className="text-gray-600 ml-1">{label}</span>
    </div>
  </div>
);

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

// Left-expanding mini-menu used in bottom-right corner
const LeftExpandingMenu: React.FC<{
  sortBy: 'date' | 'rarity' | 'subreddit';
  sortDir: 'asc' | 'desc';
  onSortChange: (s: 'date' | 'rarity' | 'subreddit') => void;
  onSortDirChange: (d: 'asc' | 'desc') => void;
  stats: { totalFound: number; uniqueSubreddits: number; firstDiscoveries: number; totalBroken: number };
  autoScroll: boolean;
  onAutoScrollToggle: () => void;
  onGiftShop: () => void;
}> = ({ sortBy, sortDir, onSortChange, onSortDirChange, stats, onGiftShop }) => {
  const [open, setOpen] = useState<'none' | 'sort' | 'stats'>('none');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen('none');
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const menuBase = 'w-12 h-12 flex items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm border border-black/30 shadow-lg active:scale-95';
  const panelBase = 'absolute top-1/2 -translate-y-1/2 right-full mr-2 bg-white border border-gray-300 rounded-lg shadow-xl p-2 min-w-[220px]';

  return (
    <div ref={containerRef} className="flex flex-col items-end gap-2">
      {/* Sort menu */}
      <div className="relative">
        <button
          className={`${menuBase}`}
          aria-haspopup="menu"
          aria-expanded={open === 'sort'}
          onClick={() => setOpen((s) => (s === 'sort' ? 'none' : 'sort'))}
          title="Sort"
        >
          ⇅
        </button>
        {open === 'sort' && (
        <div className={panelBase}>
          {/* Grid with icons + two direction cells per row */}
          {[
            { key: 'date', label: 'Date', icon: '🕒' },
            { key: 'rarity', label: 'Rarity', icon: '🏅' },
            { key: 'subreddit', label: 'Subreddit', icon: 'r/' },
          ].map((row) => {
            const isActive = (k: string, d: 'asc' | 'desc') => sortBy === (k as any) && sortDir === d;
            const cellBase = 'px-2 py-1 text-center rounded cursor-pointer text-xs';
            return (
              <div key={row.key} className="grid grid-cols-[28px_1fr_1fr] items-center gap-2 p-1">
                <div className="flex items-center justify-center text-sm">{row.icon}</div>
                <div
                  role="menuitem"
                  className={`${cellBase} ${isActive(row.key, 'desc') ? 'bg-purple-500 text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => { onSortChange(row.key as any); onSortDirChange('desc'); setOpen('none'); }}
                  title={row.key === 'subreddit' ? 'Z → A' : row.key === 'date' ? 'Newest' : 'High → Low'}
                >
                  {row.key === 'subreddit' ? 'Z → A' : row.key === 'date' ? 'Newest' : '〇 → ∘'}
                </div>
                <div
                  role="menuitem"
                  className={`${cellBase} ${isActive(row.key, 'asc') ? 'bg-purple-500 text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => { onSortChange(row.key as any); onSortDirChange('asc'); setOpen('none'); }}
                  title={row.key === 'subreddit' ? 'A → Z' : row.key === 'date' ? 'Oldest' : 'Low → High'}
                >
                  {row.key === 'subreddit' ? 'A → Z' : row.key === 'date' ? 'Oldest' : '∘ → 〇'}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Stats menu */}
      <div className="relative">
        <button
          className={`${menuBase}`}
          aria-haspopup="menu"
          aria-expanded={open === 'stats'}
          onClick={() => setOpen((s) => (s === 'stats' ? 'none' : 'stats'))}
          title="Stats"
        >
          📈
        </button>
        {open === 'stats' && (
          <div className={panelBase}>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <StatBadge icon="🏺" value={stats.totalFound} label="Found" />
              <StatBadge icon="r/" value={stats.uniqueSubreddits} label="Subs" />
              <StatBadge icon="✨" value={stats.firstDiscoveries} label="First" />
              <StatBadge icon="🗑️" value={stats.totalBroken} label="Broken" />
            </div>
          </div>
        )}
      </div>

      {/* Gift shop */}
      <button className={`${menuBase}`} onClick={onGiftShop} title="Gift Shop">🛍️</button>
    </div>
  );
};
