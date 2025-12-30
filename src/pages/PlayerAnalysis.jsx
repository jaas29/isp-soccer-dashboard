import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import PlayerCard from '../components/PlayerCard';
import PlayerRadar from '../components/PlayerRadar';
import ActivityHeatmap from '../components/ActivityHeatmap';
import KPICard, { MiniKPICard } from '../components/KPICard';
import { PageLoader } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { usePlayerStats, useEvents } from '../hooks/useFetchData';
import { calculateTeamAverages, formatPercentage, sortPlayersByMetric } from '../utils/calculations';
import { Target, Footprints, Shield, Activity } from 'lucide-react';

export default function PlayerAnalysis() {
  const { data: players, loading: playersLoading, error: playersError } = usePlayerStats();
  const { data: events, loading: eventsLoading } = useEvents();
  
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('total_touches');

  const teamAverages = useMemo(() => {
    if (!players) return null;
    return calculateTeamAverages(players);
  }, [players]);

  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    
    let filtered = [...players];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.player.toLowerCase().includes(query)
      );
    }
    
    if (positionFilter !== 'all') {
      filtered = filtered.filter(p => 
        p.position?.toLowerCase().includes(positionFilter.toLowerCase())
      );
    }
    
    return sortPlayersByMetric(filtered, sortBy);
  }, [players, searchQuery, positionFilter, sortBy]);

  const playerEvents = useMemo(() => {
    if (!events || !selectedPlayer) return [];
    return events.filter(e => 
      e.player.toLowerCase() === selectedPlayer.player.toLowerCase()
    );
  }, [events, selectedPlayer]);

  const positions = useMemo(() => {
    if (!players) return [];
    const uniquePositions = [...new Set(players.map(p => p.position).filter(Boolean))];
    return uniquePositions;
  }, [players]);

  if (playersLoading) {
    return <PageLoader />;
  }

  if (playersError) {
    return (
      <ErrorMessage 
        title="Failed to load player data"
        message={playersError}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-dark-700 border border-dark-500 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-500 rounded-lg
                         text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent-green/50"
            />
          </div>

          {/* Position Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-dark-800 border border-dark-500 rounded-lg
                         text-gray-200 focus:outline-none focus:border-accent-green/50 appearance-none cursor-pointer"
            >
              <option value="all">All Positions</option>
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-4 pr-8 py-2 bg-dark-800 border border-dark-500 rounded-lg
                         text-gray-200 focus:outline-none focus:border-accent-green/50 appearance-none cursor-pointer"
            >
              <option value="total_touches">Sort by Touches</option>
              <option value="pass_accuracy">Sort by Pass Accuracy</option>
              <option value="duel_success_rate">Sort by Duel Rate</option>
              <option value="recoveries">Sort by Recoveries</option>
              <option value="shots_on_target">Sort by Shots</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Grid */}
        <div className="lg:col-span-1">
          <div className="bg-dark-700 border border-dark-500 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Players</h3>
              <span className="text-sm text-gray-400">{filteredPlayers.length} players</span>
            </div>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {filteredPlayers.map((player) => (
                <PlayerCard
                  key={player.player}
                  player={player}
                  isSelected={selectedPlayer?.player === player.player}
                  onClick={() => setSelectedPlayer(player)}
                  compact
                />
              ))}
              
              {filteredPlayers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No players found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Player Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPlayer ? (
            <>
              {/* Player KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard
                  title="Total Touches"
                  value={selectedPlayer.total_touches || 0}
                  icon={Activity}
                  color="green"
                />
                <KPICard
                  title="Pass Accuracy"
                  value={formatPercentage(selectedPlayer.pass_accuracy)}
                  subtitle={`${selectedPlayer.passes_successful}/${selectedPlayer.passes_attempted}`}
                  icon={Target}
                  color="blue"
                />
                <KPICard
                  title="Duel Success"
                  value={formatPercentage(selectedPlayer.duel_success_rate)}
                  subtitle={`${selectedPlayer.duels_won}/${selectedPlayer.duels_attempted}`}
                  icon={Shield}
                  color="purple"
                />
                <KPICard
                  title="Recoveries"
                  value={selectedPlayer.recoveries || 0}
                  icon={Footprints}
                  color="orange"
                />
              </div>

              {/* Radar and Heatmap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PlayerRadar
                  player={selectedPlayer}
                  teamAverage={teamAverages}
                  showTeamComparison={true}
                />
                
                <ActivityHeatmap
                  events={playerEvents}
                  title={`${selectedPlayer.player}'s Activity Map`}
                  gridSize={8}
                  height={350}
                />
              </div>

              {/* Detailed Stats */}
              <div className="bg-dark-700 border border-dark-500 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Detailed Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  <MiniKPICard 
                    label="Passes" 
                    value={`${selectedPlayer.passes_successful || 0}/${selectedPlayer.passes_attempted || 0}`}
                    color="green"
                  />
                  <MiniKPICard 
                    label="Crosses" 
                    value={`${selectedPlayer.crosses_successful || 0}/${selectedPlayer.crosses_attempted || 0}`}
                    color="blue"
                  />
                  <MiniKPICard 
                    label="Shots" 
                    value={`${selectedPlayer.shots_on_target || 0}/${selectedPlayer.shots_attempted || 0}`}
                    color="purple"
                  />
                  <MiniKPICard 
                    label="Duels Won" 
                    value={selectedPlayer.duels_won || 0}
                    color="orange"
                  />
                  <MiniKPICard 
                    label="Def. Actions" 
                    value={selectedPlayer.defensive_actions || 0}
                    color="red"
                  />
                </div>

                {/* Event Breakdown */}
                <div className="mt-6 pt-4 border-t border-dark-500">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Event Breakdown</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {['Pass', 'Duel', 'Recovery', 'Shot'].map((category) => {
                      const count = playerEvents.filter(e => 
                        e.event_category === category || e.event_type === category
                      ).length;
                      const successful = playerEvents.filter(e => 
                        (e.event_category === category || e.event_type === category) && e.is_successful
                      ).length;
                      
                      return (
                        <div key={category} className="bg-dark-600 rounded-lg p-3">
                          <p className="text-xs text-gray-500 uppercase">{category}s</p>
                          <p className="text-xl font-bold text-white mt-1">{count}</p>
                          <p className="text-xs text-gray-400">
                            {count > 0 ? `${((successful / count) * 100).toFixed(0)}% success` : '-'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-dark-700 border border-dark-500 rounded-xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-600 flex items-center justify-center">
                <Activity className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-300">Select a Player</h3>
              <p className="text-gray-500 mt-2">
                Choose a player from the list to view their detailed analysis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
