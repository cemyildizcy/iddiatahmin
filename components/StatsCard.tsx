import React from 'react';
import { TeamStats } from '../types';

interface Props {
  stats: TeamStats;
  side: 'home' | 'away';
}

export const StatsCard: React.FC<Props> = ({ stats, side }) => {
  const isHome = side === 'home';
  const borderColor = isHome ? 'border-l-4 border-l-brand-500' : 'border-r-4 border-r-accent-500';
  
  return (
    <div className={`bg-slate-900 p-6 rounded-lg border border-slate-800 ${borderColor} shadow-xl`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{stats.name}</h2>
          <span className="text-xs font-mono text-slate-400 uppercase">{isHome ? 'Ev Sahibi' : 'Deplasman'} Takımı</span>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold text-brand-400">{stats.recentForm}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wide">Form Endeksi</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Hücum Gücü</span>
            <span className="text-slate-200 font-mono">{stats.attackStrength}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500/80" style={{ width: `${Math.min(100, stats.attackStrength / 2)}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Savunma Gücü</span>
            <span className="text-slate-200 font-mono">{stats.defenseStrength}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500/80" style={{ width: `${Math.min(100, stats.defenseStrength / 2)}%` }}></div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Eksik Kilit Oyuncular</h4>
        {stats.missingKeyPlayers && stats.missingKeyPlayers.length > 0 ? (
           <div className="flex flex-wrap gap-2">
             {stats.missingKeyPlayers.map((p, i) => (
               <span key={i} className="px-2 py-1 bg-red-950/30 text-red-400 text-xs rounded border border-red-900/50">{p}</span>
             ))}
           </div>
        ) : (
          <span className="text-xs text-green-500">Tam Kadro Mevcut</span>
        )}
      </div>
    </div>
  );
};