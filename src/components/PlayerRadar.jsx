import { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { calculatePlayerRadarData, calculateTeamAverages } from '../utils/calculations';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-dark-800 border border-dark-500 rounded-lg p-3 shadow-xl">
      <p className="font-medium text-white mb-2">{payload[0]?.payload?.metric}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value?.toFixed(1)}
        </p>
      ))}
    </div>
  );
};

export default function PlayerRadar({ 
  player, 
  teamAverage,
  title,
  height = 350,
  showTeamComparison = true 
}) {
  const radarData = useMemo(() => {
    if (!player) return [];
    
    const teamAvg = teamAverage || {
      pass_accuracy: 50,
      duel_success_rate: 50,
      shot_accuracy: 50,
      recoveries: 5,
      total_touches: 30
    };

    return calculatePlayerRadarData(player, teamAvg);
  }, [player, teamAverage]);

  if (!player) {
    return (
      <div className="bg-dark-700 border border-dark-500 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title || 'Player Radar'}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Select a player to view radar chart
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {title || `${player.player} Performance`}
          </h3>
          <p className="text-sm text-gray-400">{player.position}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={{ stroke: '#4b5563' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#6b7280', fontSize: 10 }}
            axisLine={{ stroke: '#374151' }}
            tickCount={5}
          />
          
          {showTeamComparison && (
            <Radar
              name="Team Average"
              dataKey="team"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.15}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          )}
          
          <Radar
            name={player.player}
            dataKey="player"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.4}
            strokeWidth={2}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-gray-300 text-sm">{value}</span>}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CompactPlayerRadar({ player, size = 150 }) {
  const radarData = useMemo(() => {
    if (!player) return [];
    return calculatePlayerRadarData(player, {
      pass_accuracy: 50,
      duel_success_rate: 50,
      shot_accuracy: 50,
      recoveries: 5,
      total_touches: 30
    });
  }, [player]);

  if (!player) return null;

  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="metric" tick={false} />
          <Radar
            dataKey="player"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.4}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
