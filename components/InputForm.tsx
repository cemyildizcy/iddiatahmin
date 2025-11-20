import React, { useState } from 'react';

interface Props {
  onAnalyze: (teamA: string, teamB: string) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<Props> = ({ onAnalyze, isLoading }) => {
  const [teamA, setTeamA] = useState('Arsenal');
  const [teamB, setTeamB] = useState('Liverpool');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(teamA, teamB);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-12">
      <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-2xl">
        <div className="flex-1 w-full">
          <label className="block text-xs font-mono text-slate-500 mb-1 ml-2">EV SAHİBİ TAKIM</label>
          <input 
            type="text"
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
            placeholder="örn. Galatasaray"
          />
        </div>
        
        <div className="flex items-center justify-center pb-3 text-slate-600 font-mono font-bold text-xl">VS</div>
        
        <div className="flex-1 w-full">
          <label className="block text-xs font-mono text-slate-500 mb-1 ml-2">DEPLASMAN TAKIM</label>
          <input 
            type="text"
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
            placeholder="örn. Fenerbahçe"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-brand-900/20 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>İŞLENİYOR</span>
            </>
          ) : (
            <>
              <span>MOTORU ÇALIŞTIR</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};