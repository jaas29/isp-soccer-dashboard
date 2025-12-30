import { User } from 'lucide-react';
import { formatPercentage } from '../utils/calculations';
import { CompactPlayerRadar } from './PlayerRadar';

export default function PlayerCard({ 
  player, 
  isSelected = false, 
  onClick,
  showRadar = false,
  compact = false
}) {
  if (!player) return null;

  const getPositionColor = (position) => {
    const pos = (position || '').toLowerCase();
    if (pos.includes('goalkeeper') || pos === 'gk') return 'bg-yellow-500/20 text-yellow-400';
    if (pos.includes('defender')) return 'bg-blue-500/20 text-blue-400';
    if (pos.includes('midfielder')) return 'bg-green-500/20 text-green-400';
    if (pos.includes('forward') || pos.includes('striker')) return 'bg-red-500/20 text-red-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`
          p-3 rounded-lg cursor-pointer transition-all duration-200
          ${isSelected 
            ? 'bg-accent-green/20 border border-accent-green/40' 
            : 'bg-dark-600 border border-dark-500 hover:border-accent-green/30'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPositionColor(player.position)}`}>
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{player.player}</p>
            <p className="text-xs text-gray-500">{player.position}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-accent-green">{player.total_touches}</p>
            <p className="text-xs text-gray-500">touches</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-xl cursor-pointer transition-all duration-300
        ${isSelected 
          ? 'bg-accent-green/10 border-2 border-accent-green/50 shadow-glow-green' 
          : 'bg-dark-700 border border-dark-500 hover:border-accent-green/30'
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
          ${getPositionColor(player.position)}
        `}>
          <User className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-white truncate">{player.player}</h4>
            <span className={`
              text-xs px-2 py-0.5 rounded-full
              ${getPositionColor(player.position)}
            `}>
              {player.position}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div>
              <p className="text-lg font-bold text-white">{player.total_touches}</p>
              <p className="text-xs text-gray-500">Touches</p>
            </div>
            <div>
              <p className="text-lg font-bold text-accent-green">
                {formatPercentage(player.pass_accuracy)}
              </p>
              <p className="text-xs text-gray-500">Pass Acc.</p>
            </div>
            <div>
              <p className="text-lg font-bold text-accent-blue">
                {formatPercentage(player.duel_success_rate)}
              </p>
              <p className="text-xs text-gray-500">Duel Rate</p>
            </div>
          </div>

          {showRadar && (
            <div className="mt-3 flex justify-center">
              <CompactPlayerRadar player={player} size={120} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-dark-500">
        <div className="text-center">
          <p className="text-sm font-medium text-white">{player.passes_successful || 0}</p>
          <p className="text-xs text-gray-500">Passes</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white">{player.duels_won || 0}</p>
          <p className="text-xs text-gray-500">Duels Won</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white">{player.recoveries || 0}</p>
          <p className="text-xs text-gray-500">Recoveries</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white">{player.shots_on_target || 0}</p>
          <p className="text-xs text-gray-500">Shots OT</p>
        </div>
      </div>
    </div>
  );
}

export function PlayerCardSkeleton() {
  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-dark-500 rounded-xl" />
        <div className="flex-1">
          <div className="h-5 w-32 bg-dark-500 rounded mb-2" />
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="h-10 bg-dark-500 rounded" />
            <div className="h-10 bg-dark-500 rounded" />
            <div className="h-10 bg-dark-500 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
