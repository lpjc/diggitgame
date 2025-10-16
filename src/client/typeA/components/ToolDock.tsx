import React from 'react';

interface ToolDockProps {
  activeTool: 'detector' | 'shovel' | 'brush' | null;
  onToolSelect: (tool: 'detector' | 'shovel' | 'brush') => void;
}

export const ToolDock: React.FC<ToolDockProps> = ({ activeTool, onToolSelect }) => {
  const tools = [
    { id: 'detector' as const, icon: '📡', label: 'Detector' },
    { id: 'shovel' as const, icon: '⛏️', label: 'Shovel' },
    { id: 'brush' as const, icon: '🖌️', label: 'Brush' },
  ];

  return (
    <div className="fixed bottom-4 right-3 flex flex-col gap-2 bg-black/60 backdrop-blur-sm rounded-xl px-2 py-2 shadow-lg" style={{ pointerEvents: 'auto' }}>
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id)}
          className={`
            w-12 h-12 rounded-lg flex items-center justify-center
            transition-all duration-150
            ${
              activeTool === tool.id
                ? 'bg-orange-500 scale-110 shadow-lg shadow-orange-500/50'
                : 'bg-gray-700/80 active:scale-95'
            }
          `}
          aria-label={tool.label}
          title={tool.label}
        >
          <span className="text-xl">{tool.icon}</span>
        </button>
      ))}
    </div>
  );
};
