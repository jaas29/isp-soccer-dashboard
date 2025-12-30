/**
 * Soccer analytics calculation utilities
 */

/**
 * Calculate pass accuracy percentage
 */
export const calculatePassAccuracy = (successful, total) => {
  if (!total || total === 0) return 0;
  return ((successful / total) * 100).toFixed(1);
};

/**
 * Calculate duel success rate
 */
export const calculateDuelSuccessRate = (won, total) => {
  if (!total || total === 0) return 0;
  return ((won / total) * 100).toFixed(1);
};

/**
 * Calculate shot accuracy (shots on target / total shots)
 */
export const calculateShotAccuracy = (onTarget, total) => {
  if (!total || total === 0) return 0;
  return ((onTarget / total) * 100).toFixed(1);
};

/**
 * Calculate conversion rate (goals / shots)
 */
export const calculateConversionRate = (goals, shots) => {
  if (!shots || shots === 0) return 0;
  return ((goals / shots) * 100).toFixed(1);
};

/**
 * Calculate team averages from player stats
 */
export const calculateTeamAverages = (players) => {
  if (!players || players.length === 0) {
    return {
      pass_accuracy: 0,
      duel_success_rate: 0,
      shot_accuracy: 0,
      recoveries: 0,
      total_touches: 0
    };
  }

  const fieldPlayers = players.filter(p => p.position !== 'Goalkeeper');
  const count = fieldPlayers.length || 1;

  return {
    pass_accuracy: fieldPlayers.reduce((sum, p) => sum + (p.pass_accuracy || 0), 0) / count,
    duel_success_rate: fieldPlayers.reduce((sum, p) => sum + (p.duel_success_rate || 0), 0) / count,
    shot_accuracy: fieldPlayers.reduce((sum, p) => sum + (p.shot_accuracy || 0), 0) / count,
    recoveries: fieldPlayers.reduce((sum, p) => sum + (p.recoveries || 0), 0) / count,
    total_touches: fieldPlayers.reduce((sum, p) => sum + (p.total_touches || 0), 0) / count
  };
};

/**
 * Get player position category
 */
export const getPositionCategory = (position) => {
  const pos = (position || '').toLowerCase();
  if (pos.includes('goalkeeper') || pos === 'gk') return 'Goalkeeper';
  if (pos.includes('defender') || pos.includes('back')) return 'Defender';
  if (pos.includes('midfielder') || pos.includes('mid')) return 'Midfielder';
  if (pos.includes('forward') || pos.includes('striker') || pos.includes('wing')) return 'Forward';
  return 'Midfielder'; // Default
};

/**
 * Get color for shot outcome
 */
export const getShotOutcomeColor = (outcome) => {
  const outcomeStr = (outcome || '').toLowerCase();
  if (outcomeStr.includes('goal')) return '#10b981'; // Green
  if (outcomeStr.includes('on target')) return '#3b82f6'; // Blue
  if (outcomeStr.includes('blocked')) return '#f97316'; // Orange
  return '#ef4444'; // Red for off target
};

/**
 * Get intensity color for heatmap
 */
export const getHeatmapColor = (value, maxValue, baseColor = 'green') => {
  const intensity = maxValue > 0 ? value / maxValue : 0;
  
  const colors = {
    green: `rgba(16, 185, 129, ${0.2 + intensity * 0.8})`,
    blue: `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`,
    red: `rgba(239, 68, 68, ${0.2 + intensity * 0.8})`,
    purple: `rgba(139, 92, 246, ${0.2 + intensity * 0.8})`
  };
  
  return colors[baseColor] || colors.green;
};

/**
 * Calculate zone statistics
 */
export const calculateZoneStats = (events, zones = ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3']) => {
  const zoneCounts = {};
  
  zones.forEach(zone => {
    zoneCounts[zone] = events.filter(e => e.zone_3x3 === zone).length;
  });
  
  return zoneCounts;
};

/**
 * Group events by minute intervals
 */
export const groupEventsByInterval = (events, interval = 5) => {
  const maxMinute = Math.max(...events.map(e => e.minute || 0), 90);
  const intervals = [];
  
  for (let i = 0; i <= maxMinute; i += interval) {
    const intervalEvents = events.filter(e => 
      e.minute >= i && e.minute < i + interval
    );
    
    intervals.push({
      minute: `${i}'`,
      events: intervalEvents.length,
      label: `${i}-${Math.min(i + interval, maxMinute)}'`
    });
  }
  
  return intervals;
};

/**
 * Calculate player performance metrics for radar chart
 */
export const calculatePlayerRadarData = (player, teamAverage) => {
  return [
    {
      metric: 'Pass Accuracy',
      player: player.pass_accuracy || 0,
      team: teamAverage.pass_accuracy || 0,
      fullMark: 100
    },
    {
      metric: 'Duel Success',
      player: player.duel_success_rate || 0,
      team: teamAverage.duel_success_rate || 0,
      fullMark: 100
    },
    {
      metric: 'Shot Accuracy',
      player: player.shot_accuracy || 0,
      team: teamAverage.shot_accuracy || 0,
      fullMark: 100
    },
    {
      metric: 'Recoveries',
      player: Math.min((player.recoveries || 0) * 7, 100),
      team: Math.min((teamAverage.recoveries || 0) * 7, 100),
      fullMark: 100
    },
    {
      metric: 'Involvement',
      player: Math.min((player.total_touches || 0) * 1.5, 100),
      team: Math.min((teamAverage.total_touches || 0) * 1.5, 100),
      fullMark: 100
    }
  ];
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString();
};

/**
 * Format percentage
 */
export const formatPercentage = (num) => {
  if (num === null || num === undefined) return '-';
  return `${Number(num).toFixed(1)}%`;
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get ordinal suffix for numbers
 */
export const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/**
 * Sort players by a given metric
 */
export const sortPlayersByMetric = (players, metric, ascending = false) => {
  return [...players].sort((a, b) => {
    const valA = a[metric] || 0;
    const valB = b[metric] || 0;
    return ascending ? valA - valB : valB - valA;
  });
};

/**
 * Get top performers for a metric
 */
export const getTopPerformers = (players, metric, count = 5) => {
  return sortPlayersByMetric(players, metric).slice(0, count);
};
