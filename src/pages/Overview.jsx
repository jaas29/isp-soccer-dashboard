import { useMemo } from 'react';
import { Target, Crosshair, Shield, TrendingUp, Activity, Users, Clock } from 'lucide-react';
import KPICard, { KPICardSkeleton } from '../components/KPICard';
import TrendChart from '../components/TrendChart';
import { PageLoader } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useOverviewStats, useTimeline, usePlayerStats, useMatchSummary } from '../hooks/useFetchData';
import { formatPercentage, getTopPerformers } from '../utils/calculations';

export default function Overview() {
  const { data: stats, loading: statsLoading, error: statsError } = useOverviewStats();
  const { data: timeline, loading: timelineLoading } = useTimeline(null, 10);
  const { data: players, loading: playersLoading } = usePlayerStats();
  const { data: matchSummary } = useMatchSummary();

  const topPerformers = useMemo(() => {
    if (!players) return [];
    return getTopPerformers(players, 'total_touches', 5);
  }, [players]);

  if (statsLoading) {
    return <PageLoader />;
  }

  if (statsError) {
    return (
      <ErrorMessage 
        title="Failed to load overview data"
        message={statsError}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Match Info */}
      {matchSummary && (
        <div className="bg-dark-700 border border-dark-500 rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-400">Match Duration:</span>
              <span className="text-white font-medium">{matchSummary.duration_minutes || 90} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-gray-400">Total Events:</span>
              <span className="text-white font-medium">{matchSummary.total_events || stats?.totalEvents}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-400">Players:</span>
              <span className="text-white font-medium">{matchSummary.players || players?.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Shots"
          value={stats?.totalShots || 0}
          subtitle={`${stats?.shotsOnTarget || 0} on target`}
          icon={Target}
          color="green"
        />
        <KPICard
          title="Pass Accuracy"
          value={`${stats?.passAccuracy || 0}%`}
          subtitle={`${stats?.successfulPasses || 0}/${stats?.totalPasses || 0}`}
          icon={Crosshair}
          color="blue"
        />
        <KPICard
          title="Duels Won"
          value={stats?.duelsWon || 0}
          subtitle={`${stats?.duelSuccessRate || 0}% success`}
          icon={Shield}
          color="purple"
        />
        <KPICard
          title="Recoveries"
          value={stats?.recoveries || 0}
          subtitle="ball recoveries"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pass Accuracy Trend */}
        <TrendChart
          data={timeline || []}
          title="Pass Accuracy Over Time"
          xDataKey="minute"
          lines={[
            { dataKey: 'passAccuracy', name: 'Pass Accuracy %', color: '#10b981' }
          ]}
          type="area"
          height={280}
        />

        {/* Event Distribution */}
        <TrendChart
          data={timeline || []}
          title="Event Distribution"
          xDataKey="minute"
          lines={[
            { dataKey: 'events', name: 'Events', color: '#3b82f6' }
          ]}
          type="bar"
          height={280}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Duels Performance */}
        <TrendChart
          data={timeline || []}
          title="Duels Performance"
          xDataKey="minute"
          lines={[
            { dataKey: 'duels', name: 'Total Duels', color: '#f97316' },
            { dataKey: 'duelsWon', name: 'Duels Won', color: '#10b981' }
          ]}
          type="line"
          height={280}
        />

        {/* Top Performers */}
        <div className="bg-dark-700 border border-dark-500 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Performers</h3>
          <div className="space-y-3">
            {topPerformers.map((player, index) => (
              <div 
                key={player.player}
                className="flex items-center gap-4 p-3 bg-dark-600 rounded-lg"
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-400/20 text-gray-300' :
                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-dark-500 text-gray-400'}
                `}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{player.player}</p>
                  <p className="text-xs text-gray-500">{player.position}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-accent-green">{player.total_touches}</p>
                  <p className="text-xs text-gray-500">touches</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{formatPercentage(player.pass_accuracy)}</p>
                  <p className="text-xs text-gray-500">pass acc.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
