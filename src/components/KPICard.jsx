import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * KPI Card component for displaying key metrics
 */
export default function KPICard({ 
  title, 
  value, 
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  color = 'green',
  className = ''
}) {
  const colorClasses = {
    green: {
      bg: 'bg-accent-green/10',
      border: 'border-accent-green/20',
      text: 'text-accent-green',
      icon: 'text-accent-green'
    },
    blue: {
      bg: 'bg-accent-blue/10',
      border: 'border-accent-blue/20',
      text: 'text-accent-blue',
      icon: 'text-accent-blue'
    },
    purple: {
      bg: 'bg-accent-purple/10',
      border: 'border-accent-purple/20',
      text: 'text-accent-purple',
      icon: 'text-accent-purple'
    },
    orange: {
      bg: 'bg-accent-orange/10',
      border: 'border-accent-orange/20',
      text: 'text-accent-orange',
      icon: 'text-accent-orange'
    },
    red: {
      bg: 'bg-accent-red/10',
      border: 'border-accent-red/20',
      text: 'text-accent-red',
      icon: 'text-accent-red'
    }
  };

  const colors = colorClasses[color] || colorClasses.green;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-accent-green' : trend === 'down' ? 'text-accent-red' : 'text-gray-500';

  return (
    <div className={`
      bg-dark-700 border border-dark-500 rounded-xl p-5
      transition-all duration-300 hover:border-${color === 'green' ? 'accent-green' : color}/30
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${colors.text}`}>
              {value}
            </span>
            {subtitle && (
              <span className="text-sm text-gray-500">{subtitle}</span>
            )}
          </div>
          
          {(trend || trendValue) && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Mini KPI card for compact displays
 */
export function MiniKPICard({ label, value, color = 'green' }) {
  const colorClasses = {
    green: 'text-accent-green',
    blue: 'text-accent-blue',
    purple: 'text-accent-purple',
    orange: 'text-accent-orange',
    red: 'text-accent-red'
  };

  return (
    <div className="bg-dark-600 rounded-lg p-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 ${colorClasses[color]}`}>{value}</p>
    </div>
  );
}

/**
 * Loading skeleton for KPI cards
 */
export function KPICardSkeleton() {
  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 bg-dark-500 rounded" />
          <div className="mt-3 h-8 w-20 bg-dark-500 rounded" />
          <div className="mt-3 h-3 w-16 bg-dark-500 rounded" />
        </div>
        <div className="w-12 h-12 bg-dark-500 rounded-lg" />
      </div>
    </div>
  );
}
