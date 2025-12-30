import { useMemo } from 'react';
import { getHeatmapColor } from '../utils/calculations';

export default function ActivityHeatmap({ 
  events = [], 
  title = "Activity Heatmap",
  gridSize = 10,
  height = 300,
  colorScheme = 'green'
}) {
  const gridData = useMemo(() => {
    if (!events || events.length === 0) return { grid: [], maxCount: 0 };
    
    const cellWidth = 100 / gridSize;
    const cellHeight = 100 / gridSize;
    const grid = [];
    let maxCount = 0;
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const xMin = col * cellWidth;
        const xMax = (col + 1) * cellWidth;
        const yMin = row * cellHeight;
        const yMax = (row + 1) * cellHeight;
        
        const count = events.filter(e => {
          const x = parseFloat(e.x) || 0;
          const y = parseFloat(e.y) || 0;
          return x >= xMin && x < xMax && y >= yMin && y < yMax;
        }).length;
        
        if (count > maxCount) maxCount = count;
        
        grid.push({
          row,
          col,
          count,
          x: xMin + cellWidth / 2,
          y: yMin + cellHeight / 2
        });
      }
    }
    
    return { grid, maxCount };
  }, [events, gridSize]);

  const { grid, maxCount } = gridData;

  if (events.length === 0) {
    return (
      <div className="bg-dark-700 border border-dark-500 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center text-gray-500" style={{ height }}>
          No activity data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-gray-400">{events.length} events</span>
      </div>

      <div className="relative" style={{ height }}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
          <rect x="0" y="0" width="100" height="100" fill="none" stroke="#10b981" strokeWidth="0.5" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#10b981" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="9" fill="none" stroke="#10b981" strokeWidth="0.3" />
          <rect x="0" y="20" width="16.5" height="60" fill="none" stroke="#10b981" strokeWidth="0.3" />
          <rect x="83.5" y="20" width="16.5" height="60" fill="none" stroke="#10b981" strokeWidth="0.3" />
        </svg>

        <div 
          className="grid gap-[1px]"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            height: '100%'
          }}
        >
          {grid.map((cell, index) => (
            <div
              key={index}
              className="rounded-sm transition-all duration-200 hover:scale-110 cursor-default"
              style={{ 
                backgroundColor: cell.count > 0 
                  ? getHeatmapColor(cell.count, maxCount, colorScheme)
                  : 'rgba(45, 45, 61, 0.3)'
              }}
              title={`${cell.count} events`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-500">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Low</span>
          <div className="flex gap-[2px]">
            {[0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
              <div
                key={i}
                className="w-4 h-3 rounded-sm"
                style={{ backgroundColor: getHeatmapColor(intensity, 1, colorScheme) }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">High</span>
        </div>
        <span className="text-xs text-gray-400">Max: {maxCount} events</span>
      </div>
    </div>
  );
}

export function CompactHeatmap({ events = [], size = 100, gridSize = 6 }) {
  const gridData = useMemo(() => {
    if (!events || events.length === 0) return { grid: [], maxCount: 0 };
    
    const cellSize = 100 / gridSize;
    const grid = [];
    let maxCount = 0;
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const count = events.filter(e => {
          const x = parseFloat(e.x) || 0;
          const y = parseFloat(e.y) || 0;
          return x >= col * cellSize && x < (col + 1) * cellSize &&
                 y >= row * cellSize && y < (row + 1) * cellSize;
        }).length;
        
        if (count > maxCount) maxCount = count;
        grid.push({ count });
      }
    }
    
    return { grid, maxCount };
  }, [events, gridSize]);

  return (
    <div 
      className="grid gap-[1px] rounded overflow-hidden"
      style={{ 
        width: size, 
        height: size,
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`
      }}
    >
      {gridData.grid.map((cell, index) => (
        <div
          key={index}
          style={{ 
            backgroundColor: cell.count > 0 
              ? getHeatmapColor(cell.count, gridData.maxCount, 'green')
              : 'rgba(45, 45, 61, 0.5)'
          }}
        />
      ))}
    </div>
  );
}
