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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-black/70 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id)}
          className={`
            flex flex-col items-center justify-center
            w-16 h-16 rounded-full
            transition-all duration-200
            ${
              activeTool === tool.id
                ? 'bg-orange-500 scale-110 shadow-lg shadow-orange-500/50'
                : 'bg-gray-700 hover:bg-gray-600'
            }
          `}
          aria-label={tool.label}
        >
          <span className="text-2xl">{tool.icon}</span>
          <span className="text-[10px] text-white mt-1">{tool.label}</span>
        </button>
      ))}
    </div>
  );
};
