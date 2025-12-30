import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-dark-800 border border-dark-500 rounded-lg p-3 shadow-xl">
      <p className="font-medium text-white mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function TrendChart({
  data = [],
  title,
  xDataKey = 'minute',
  lines = [],
  type = 'line',
  height = 300,
  showLegend = true,
  showGrid = true
}) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-dark-700 border border-dark-500 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="h-48 flex items-center justify-center text-gray-500">
          No trend data available
        </div>
      </div>
    );
  }

  const defaultLines = lines.length > 0 ? lines : [
    { dataKey: 'value', name: 'Value', color: '#10b981' }
  ];

  const ChartComponent = type === 'area' ? AreaChart : type === 'bar' ? BarChart : LineChart;
  const DataComponent = type === 'area' ? Area : type === 'bar' ? Bar : Line;

  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-6">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3d" />}
          <XAxis 
            dataKey={xDataKey} 
            stroke="#6b7280"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={{ stroke: '#4b5563' }}
            axisLine={{ stroke: '#4b5563' }}
          />
          <YAxis 
            stroke="#6b7280"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={{ stroke: '#4b5563' }}
            axisLine={{ stroke: '#4b5563' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => <span className="text-gray-300 text-sm">{value}</span>}
            />
          )}
          
          {defaultLines.map((line, index) => {
            if (type === 'area') {
              return (
                <Area
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={line.color}
                  fill={line.color}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              );
            } else if (type === 'bar') {
              return (
                <Bar
                  key={line.dataKey}
                  dataKey={line.dataKey}
                  name={line.name}
                  fill={line.color}
                  radius={[4, 4, 0, 0]}
                />
              );
            } else {
              return (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={{ fill: line.color, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: line.color }}
                />
              );
            }
          })}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

export function PassAccuracyTrend({ data, height = 250 }) {
  return (
    <TrendChart
      data={data}
      title="Pass Accuracy Over Time"
      xDataKey="minute"
      lines={[
        { dataKey: 'passAccuracy', name: 'Pass Accuracy %', color: '#10b981' }
      ]}
      type="area"
      height={height}
    />
  );
}

export function EventDistribution({ data, height = 250 }) {
  return (
    <TrendChart
      data={data}
      title="Event Distribution"
      xDataKey="minute"
      lines={[
        { dataKey: 'events', name: 'Events', color: '#3b82f6' }
      ]}
      type="bar"
      height={height}
    />
  );
}

export function DuelsTrend({ data, height = 250 }) {
  return (
    <TrendChart
      data={data}
      title="Duels Performance"
      xDataKey="minute"
      lines={[
        { dataKey: 'duels', name: 'Total Duels', color: '#f97316' },
        { dataKey: 'duelsWon', name: 'Duels Won', color: '#10b981' }
      ]}
      type="line"
      height={height}
    />
  );
}
