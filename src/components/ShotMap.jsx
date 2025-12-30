import { useMemo } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { getShotOutcomeColor } from '../utils/calculations';

/**
 * Soccer field background component
 */
const SoccerFieldSVG = () => (
  <svg 
    viewBox="0 0 105 68" 
    className="absolute inset-0 w-full h-full opacity-20"
    preserveAspectRatio="none"
  >
    {/* Field outline */}
    <rect x="0" y="0" width="105" height="68" fill="none" stroke="#10b981" strokeWidth="0.5" />
    
    {/* Center line */}
    <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#10b981" strokeWidth="0.3" />
    
    {/* Center circle */}
    <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#10b981" strokeWidth="0.3" />
    
    {/* Center spot */}
    <circle cx="52.5" cy="34" r="0.3" fill="#10b981" />
    
    {/* Left penalty area */}
    <rect x="0" y="13.84" width="16.5" height="40.32" fill="none" stroke="#10b981" strokeWidth="0.3" />
    
    {/* Right penalty area */}
    <rect x="88.5" y="13.84" width="16.5" height="40.32" fill="none" stroke="#10b981" strokeWidth="0.3" />
    
    {/* Left goal area */}
    <rect x="0" y="24.84" width="5.5" height="18.32" fill="none" stroke="#10b981" strokeWidth="0.3" />
    
    {/* Right goal area */}
    <rect x="99.5" y="24.84" width="5.5" height="18.32" fill="none" stroke="#10b981" strokeWidth="0.3" />
    
    {/* Left penalty spot */}
    <circle cx="11" cy="34" r="0.3" fill="#10b981" />
    
    {/* Right penalty spot */}
    <circle cx="94" cy="34" r="0.3" fill="#10b981" />
    
    {/* Goals */}
    <rect x="-2" y="30.34" width="2" height="7.32" fill="none" stroke="#10b981" strokeWidth="0.3" />
    <rect x="105" y="30.34" width="2" height="7.32" fill="none" stroke="#10b981" strokeWidth="0.3" />
  </svg>
);

/**
 * Custom tooltip for shot map
 */
const ShotTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-dark-800 border border-dark-500 rounded-lg p-3 shadow-xl">
      <p className="font-semibold text-white">{data.player}</p>
      <p className="text-sm text-gray-400">{data.minute}'</p>
      <p className={`text-sm font-medium`} style={{ color: getShotOutcomeColor(data.outcome) }}>
        {data.outcome}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Position: ({data.x.toFixed(0)}, {data.y.toFixed(0)})
      </p>
    </div>
  );
};

/**
 * Shot Map Component
 * Displays shots on a soccer field with color-coded outcomes
 */
export default function ShotMap({ 
  shots = [], 
  title = "Shot Map",
  showLegend = true,
  height = 400 
}) {
  // Process shot data
  const shotData = useMemo(() => {
    if (!shots || shots.length === 0) return [];
    
    return shots.map((shot, index) => ({
      ...shot,
      x: parseFloat(shot.x) || 0,
      y: parseFloat(shot.y) || 0,
      color: getShotOutcomeColor(shot.outcome),
      size: shot.outcome?.toLowerCase().includes('goal') ? 120 : 80
    }));
  }, [shots]);

  // Group shots by outcome for legend
  const shotsByOutcome = useMemo(() => {
    const groups = {
      goal: shotData.filter(s => s.outcome?.toLowerCase().includes('goal')),
      onTarget: shotData.filter(s => s.outcome?.toLowerCase().includes('on target')),
      blocked: shotData.filter(s => s.outcome?.toLowerCase().includes('blocked')),
      offTarget: shotData.filter(s => 
        s.outcome?.toLowerCase().includes('off') || 
        (!s.outcome?.toLowerCase().includes('goal') && 
         !s.outcome?.toLowerCase().includes('target') &&
         !s.outcome?.toLowerCase().includes('blocked'))
      )
    };
    return groups;
  }, [shotData]);

  if (shotData.length === 0) {
    return (
      <div className="bg-dark-700 border border-dark-500 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No shot data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-gray-400">{shotData.length} shots</span>
      </div>

      <div className="relative" style={{ height }}>
        {/* Soccer field background */}
        <SoccerFieldSVG />
        
        {/* Scatter chart */}
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3d" />
            <XAxis 
              type="number" 
              dataKey="x" 
              domain={[0, 110]} 
              stroke="#6b7280"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={{ stroke: '#4b5563' }}
              axisLine={{ stroke: '#4b5563' }}
              label={{ value: 'Field Length', position: 'bottom', fill: '#9ca3af', fontSize: 11 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              domain={[0, 100]} 
              stroke="#6b7280"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={{ stroke: '#4b5563' }}
              axisLine={{ stroke: '#4b5563' }}
              label={{ value: 'Field Width', angle: -90, position: 'left', fill: '#9ca3af', fontSize: 11 }}
            />
            <Tooltip content={<ShotTooltip />} />
            
            <Scatter 
              name="Shots" 
              data={shotData}
              shape="circle"
            >
              {shotData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={entry.color}
                  strokeWidth={1}
                  r={entry.size / 10}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-dark-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-green" />
            <span className="text-sm text-gray-400">Goal ({shotsByOutcome.goal.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-blue" />
            <span className="text-sm text-gray-400">On Target ({shotsByOutcome.onTarget.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-orange" />
            <span className="text-sm text-gray-400">Blocked ({shotsByOutcome.blocked.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-red" />
            <span className="text-sm text-gray-400">Off Target ({shotsByOutcome.offTarget.length})</span>
          </div>
        </div>
      )}
    </div>
  );
}
