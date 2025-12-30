import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Image, 
  Table2, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import KPICard from '../components/KPICard';
import ShotMap from '../components/ShotMap';
import PressureZones from '../components/PressureZones';
import TrendChart from '../components/TrendChart';
import { PageLoader } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { 
  useOverviewStats, 
  usePlayerStats, 
  useTeamStats, 
  useShots,
  useZonePressure,
  useTimeline,
  useEvents
} from '../hooks/useFetchData';
import { 
  exportToPDF, 
  exportToPNG, 
  exportPlayerStats, 
  exportTeamStats,
  exportEvents
} from '../utils/export';
import { Target, Crosshair, Shield, TrendingUp } from 'lucide-react';

export default function Reports() {
  const { data: stats, loading: statsLoading } = useOverviewStats();
  const { data: players, loading: playersLoading } = usePlayerStats();
  const { data: teamStats } = useTeamStats();
  const { data: shots } = useShots();
  const { data: zonePressure } = useZonePressure();
  const { data: timeline } = useTimeline(null, 10);
  const { data: events } = useEvents();

  const [exportStatus, setExportStatus] = useState({});
  const [exporting, setExporting] = useState(null);

  const handleExport = async (type, format) => {
    const key = `${type}-${format}`;
    setExporting(key);
    setExportStatus(prev => ({ ...prev, [key]: 'loading' }));

    try {
      let success = false;

      switch (format) {
        case 'pdf':
          success = await exportToPDF('report-content', `${type}_report.pdf`);
          break;
        case 'png':
          success = await exportToPNG('report-content', `${type}_chart.png`);
          break;
        case 'csv':
          if (type === 'players') {
            success = exportPlayerStats(players, 'player_stats.csv');
          } else if (type === 'team') {
            success = exportTeamStats(teamStats, 'team_stats.csv');
          } else if (type === 'events') {
            success = exportEvents(events, 'events.csv');
          }
          break;
      }

      setExportStatus(prev => ({ ...prev, [key]: success ? 'success' : 'error' }));
      
      setTimeout(() => {
        setExportStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[key];
          return newStatus;
        });
      }, 3000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus(prev => ({ ...prev, [key]: 'error' }));
    } finally {
      setExporting(null);
    }
  };

  const ExportButton = ({ type, format, icon: Icon, label }) => {
    const key = `${type}-${format}`;
    const status = exportStatus[key];
    const isLoading = exporting === key;

    return (
      <button
        onClick={() => handleExport(type, format)}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
          transition-all duration-200
          ${status === 'success' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : status === 'error'
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-dark-600 text-gray-200 border border-dark-500 hover:border-accent-green/30'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle className="w-4 h-4" />
        ) : status === 'error' ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
        {label}
      </button>
    );
  };

  if (statsLoading || playersLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Export Options */}
      <div className="bg-dark-700 border border-dark-500 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Full Report */}
          <div className="bg-dark-600 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-accent-green/20 rounded-lg">
                <FileText className="w-5 h-5 text-accent-green" />
              </div>
              <div>
                <h4 className="font-medium text-white">Full Report</h4>
                <p className="text-xs text-gray-500">Complete match analysis</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ExportButton type="full" format="pdf" icon={Download} label="PDF" />
              <ExportButton type="full" format="png" icon={Image} label="PNG" />
            </div>
          </div>

          {/* Player Stats */}
          <div className="bg-dark-600 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-accent-blue/20 rounded-lg">
                <Table2 className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <h4 className="font-medium text-white">Player Statistics</h4>
                <p className="text-xs text-gray-500">Individual player data</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ExportButton type="players" format="csv" icon={Download} label="CSV" />
            </div>
          </div>

          {/* Events Data */}
          <div className="bg-dark-600 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-accent-purple/20 rounded-lg">
                <Table2 className="w-5 h-5 text-accent-purple" />
              </div>
              <div>
                <h4 className="font-medium text-white">Match Events</h4>
                <p className="text-xs text-gray-500">All match events with coordinates</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ExportButton type="events" format="csv" icon={Download} label="CSV" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div id="report-content" className="space-y-6 bg-dark-900 p-6 rounded-xl">
        <div className="text-center border-b border-dark-600 pb-6">
          <h1 className="text-2xl font-bold text-white">Match Analysis Report</h1>
          <p className="text-gray-400 mt-2">NCF Soccer Analytics Dashboard</p>
          <p className="text-sm text-gray-500 mt-1">
            Generated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Summary KPIs */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Key Performance Indicators</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              icon={Crosshair}
              color="blue"
            />
            <KPICard
              title="Duels Won"
              value={stats?.duelsWon || 0}
              subtitle={`${stats?.duelSuccessRate || 0}%`}
              icon={Shield}
              color="purple"
            />
            <KPICard
              title="Recoveries"
              value={stats?.recoveries || 0}
              icon={TrendingUp}
              color="orange"
            />
          </div>
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ShotMap 
            shots={shots || []}
            title="Shot Map"
            height={350}
          />
          <PressureZones
            zoneCounts={zonePressure || {}}
            title="Pressure Zones"
          />
        </div>

        {/* Trend Chart */}
        <TrendChart
          data={timeline || []}
          title="Match Timeline - Pass Accuracy"
          xDataKey="minute"
          lines={[
            { dataKey: 'passAccuracy', name: 'Pass Accuracy %', color: '#10b981' }
          ]}
          type="area"
          height={250}
        />

        {/* Player Table */}
        <div className="bg-dark-700 border border-dark-500 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Player Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-500">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Player</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Position</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Touches</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Pass Acc.</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Duels Won</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Recoveries</th>
                </tr>
              </thead>
              <tbody>
                {players?.slice(0, 10).map((player, index) => (
                  <tr 
                    key={player.player}
                    className={`border-b border-dark-600 ${index % 2 === 0 ? 'bg-dark-600/30' : ''}`}
                  >
                    <td className="py-3 px-4 font-medium text-white">{player.player}</td>
                    <td className="py-3 px-4 text-gray-400">{player.position}</td>
                    <td className="py-3 px-4 text-right text-white">{player.total_touches}</td>
                    <td className="py-3 px-4 text-right text-accent-green">
                      {player.pass_accuracy?.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right text-white">{player.duels_won}</td>
                    <td className="py-3 px-4 text-right text-white">{player.recoveries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
