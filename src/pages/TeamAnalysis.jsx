import { useMemo } from 'react';
import ShotMap from '../components/ShotMap';
import PressureZones from '../components/PressureZones';
import TrendChart from '../components/TrendChart';
import KPICard from '../components/KPICard';
import { PageLoader } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { 
  useShots, 
  useZonePressure, 
  useTeamStats, 
  useEvents,
  useTimeline 
} from '../hooks/useFetchData';
import { Target, Crosshair, Shield, Goal } from 'lucide-react';

export default function TeamAnalysis() {
  const { data: shots, loading: shotsLoading, error: shotsError } = useShots();
  const { data: zonePressure, loading: zonesLoading } = useZonePressure();
  const { data: teamStats, loading: teamLoading } = useTeamStats();
  const { data: events, loading: eventsLoading } = useEvents();
  const { data: timeline } = useTimeline(null, 15);

  const team = useMemo(() => {
    if (!teamStats || teamStats.length === 0) return null;
    return teamStats[0];
  }, [teamStats]);

  const passZones = useMemo(() => {
    if (!events) return {};
    
    const passes = events.filter(e => e.event_category === 'Pass');
    const zones = ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'];
    const zoneCounts = {};
    
    zones.forEach(zone => {
      zoneCounts[zone] = passes.filter(e => e.zone_3x3 === zone).length;
    });
    
    return zoneCounts;
  }, [events]);

  if (shotsLoading || zonesLoading || teamLoading) {
    return <PageLoader />;
  }

  if (shotsError) {
    return (
      <ErrorMessage 
        title="Failed to load team analysis data"
        message={shotsError}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Team KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Shots"
          value={team?.total_shots || shots?.length || 0}
          subtitle={`${team?.shots_on_target || 0} on target`}
          icon={Target}
          color="green"
        />
        <KPICard
          title="Conversion Rate"
          value={`${(team?.conversion_rate * 100 || 0).toFixed(1)}%`}
          subtitle="goals per shot"
          icon={Goal}
          color="blue"
        />
        <KPICard
          title="Pass Accuracy"
          value={`${(team?.pass_accuracy || 0).toFixed(1)}%`}
          subtitle={`${team?.passes_successful || 0}/${team?.total_passes || 0}`}
          icon={Crosshair}
          color="purple"
        />
        <KPICard
          title="Duels Won"
          value={team?.defensive_duels_won || 0}
          subtitle="defensive duels"
          icon={Shield}
          color="orange"
        />
      </div>

      {/* Main Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shot Map */}
        <ShotMap 
          shots={shots || []}
          title="Shot Map"
          height={400}
        />

        {/* Pressure Zones */}
        <PressureZones
          zoneCounts={zonePressure || {}}
          title="Defensive Pressure Zones"
          showLabels={true}
        />
      </div>

      {/* Secondary Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pass Distribution Zones */}
        <PressureZones
          zoneCounts={passZones}
          title="Pass Distribution by Zone"
          showLabels={true}
          colorScheme="blue"
        />

        {/* Shot Timeline */}
        <div className="bg-dark-700 border border-dark-500 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Shot Timeline</h3>
          <div className="space-y-2">
            {shots?.slice(0, 10).map((shot, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-3 bg-dark-600 rounded-lg"
              >
                <div className="w-12 text-center">
                  <span className="text-lg font-bold text-white">{shot.minute}'</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{shot.player}</p>
                  <p className="text-sm text-gray-500">
                    From ({shot.x?.toFixed(0)}, {shot.y?.toFixed(0)}) - {shot.zone_third}
                  </p>
                </div>
                <div className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${shot.outcome?.toLowerCase().includes('goal') ? 'bg-green-500/20 text-green-400' :
                    shot.outcome?.toLowerCase().includes('on target') ? 'bg-blue-500/20 text-blue-400' :
                    shot.outcome?.toLowerCase().includes('blocked') ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'}
                `}>
                  {shot.outcome}
                </div>
              </div>
            ))}
            {(!shots || shots.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No shots recorded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          data={timeline || []}
          title="Shots Per Interval"
          xDataKey="minute"
          lines={[
            { dataKey: 'shots', name: 'Shots', color: '#10b981' }
          ]}
          type="bar"
          height={250}
        />

        <TrendChart
          data={timeline || []}
          title="Recoveries Per Interval"
          xDataKey="minute"
          lines={[
            { dataKey: 'recoveries', name: 'Recoveries', color: '#8b5cf6' }
          ]}
          type="area"
          height={250}
        />
      </div>
    </div>
  );
}
