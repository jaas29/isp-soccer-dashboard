import { useMemo } from 'react';
import { ZONE_ORDER, ZONES_3X3 } from '../utils/coordinates';
import { getHeatmapColor } from '../utils/calculations';

const ZoneCell = ({ zone, count, maxCount, showLabels }) => {
  const intensity = maxCount > 0 ? count / maxCount : 0;
  const backgroundColor = getHeatmapColor(count, maxCount, 'green');
  
  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-lg transition-all duration-300 hover:scale-105 cursor-default"
      style={{ backgroundColor }}
    >
      <span className="text-2xl font-bold text-white drop-shadow-lg">{count}</span>
      {showLabels && (
        <span className="text-xs text-white/80 mt-1">{ZONES_3X3[zone]?.label || zone}</span>
      )}
      <div 
        className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1 rounded-full bg-white/30"
        style={{ width: `${Math.max(20, intensity * 80)}%` }}
      />
    </div>
  );
};

export default function PressureZones({ 
  zoneCounts = {}, 
  title = "Pressure Zones",
  showLabels = true,
  colorScheme = 'green'
}) {
  const processedData = useMemo(() => {
    const zones = ['R3C1', 'R3C2', 'R3C3', 'R2C1', 'R2C2', 'R2C3', 'R1C1', 'R1C2', 'R1C3'];
    const counts = zones.map(zone => zoneCounts[zone] || 0);
    const maxCount = Math.max(...counts, 1);
    const totalCount = counts.reduce((a, b) => a + b, 0);
    
    return { zones, counts, maxCount, totalCount };
  }, [zoneCounts]);

  const { zones, counts, maxCount, totalCount } = processedData;

  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-gray-400">{totalCount} actions</span>
      </div>

      <div className="relative">
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-500 whitespace-nowrap">
          Attacking Direction →
        </div>
        
        <div className="grid grid-cols-3 gap-2 aspect-[3/2] ml-4">
          {zones.map((zone, index) => (
            <ZoneCell
              key={zone}
              zone={zone}
              count={counts[index]}
              maxCount={maxCount}
              showLabels={showLabels}
            />
          ))}
        </div>

        <div className="flex justify-between mt-2 ml-4 text-xs text-gray-500">
          <span>Defensive Third</span>
          <span>Middle Third</span>
          <span>Attacking Third</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getHeatmapColor(0.2, 1, colorScheme) }} />
          <span className="text-xs text-gray-500">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getHeatmapColor(0.5, 1, colorScheme) }} />
          <span className="text-xs text-gray-500">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getHeatmapColor(1, 1, colorScheme) }} />
          <span className="text-xs text-gray-500">High</span>
        </div>
      </div>
    </div>
  );
}
