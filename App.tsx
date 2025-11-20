import React, { useState, useCallback } from 'react';
import { fetchMatchData, getDeepAnalysis } from './services/geminiService';
import { ProbabilityEngine } from './utils/probabilityEngine';
import { ScrapedData, SimulationResult } from './types';
import { InputForm } from './components/InputForm';
import { StatsCard } from './components/StatsCard';
import { DistributionChart } from './components/DistributionChart';

const engine = new ProbabilityEngine();

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [data, setData] = useState<ScrapedData | null>(null);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const runSimulation = useCallback(async (teamA: string, teamB: string) => {
    setIsLoading(true);
    setData(null);
    setSimResult(null);
    setAnalysis(null);

    try {
      // 1. "Scrape" Data using Gemini Search
      setStatusMessage(`Veri Toplayıcı Başlatılıyor... ${teamA} ve ${teamB} istatistikleri aranıyor...`);
      const scrapedData = await fetchMatchData(teamA, teamB);
      setData(scrapedData);

      // 2. Run Mathematical Core
      setStatusMessage('Ağırlıklı Poisson Dağılımı Kalibre Ediliyor...');
      await new Promise(r => setTimeout(r, 800)); // UX delay to show steps

      setStatusMessage('Monte Carlo Simülasyonu Çalıştırılıyor (10.000 iterasyon)...');
      const result = engine.runMonteCarlo({
        teamA: scrapedData.teamA,
        teamB: scrapedData.teamB,
        weatherFactor: 1.0, // Default, could be enhanced by weather API
        refereeStrictness: 5
      });
      setSimResult(result);

      // 3. Get Deep Analysis (Thinking Model)
      setStatusMessage('Taktiksel doğrulama için Gemini 3 Pro\'ya danışılıyor...');
      const analysisText = await getDeepAnalysis(
        teamA, 
        teamB, 
        JSON.stringify({ 
          prob: { home: result.homeWinProb, draw: result.drawProb, away: result.awayWinProb }, 
          variance: result.variance 
        })
      );
      setAnalysis(analysisText);

    } catch (error) {
      console.error(error);
      alert("Simülasyon Başarısız Oldu: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/30 border border-brand-500/30 text-brand-400 text-xs font-mono mb-4">
           <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
           MONTE CARLO v3.1
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
          Stokastik Futbol <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-500">Tahmincisi</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          <span className="text-slate-200 font-semibold">Ağırlıklı Poisson Dağılımları</span> ve 
          <span className="text-slate-200 font-semibold"> Gerçek Zamanlı Google Arama Temellendirmesi</span> kullanan akademik düzeyde bir tahmin motoru.
        </p>
      </div>

      {/* Input */}
      <InputForm onAnalyze={runSimulation} isLoading={isLoading} />

      {/* Status / Loading Overlay */}
      {isLoading && (
        <div className="max-w-md mx-auto text-center mb-12 animate-pulse">
          <div className="font-mono text-brand-400 text-sm">{statusMessage}</div>
          <div className="mt-4 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
             <div className="h-full bg-brand-500 w-1/2 animate-[shimmer_1s_infinite]"></div>
          </div>
        </div>
      )}

      {/* Results Dashboard */}
      {data && simResult && !isLoading && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 animate-[fadeIn_0.5s_ease-out]">
          
          {/* Left Column: Scraper Data */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-sm font-mono text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">Toplanan Girdi Verileri</h3>
            <StatsCard stats={data.teamA} side="home" />
            <StatsCard stats={data.teamB} side="away" />
            
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <h4 className="text-xs text-slate-500 uppercase mb-1">Hava Durumu Bağlamı</h4>
              <p className="text-sm text-slate-300">{data.weatherForecast}</p>
            </div>
          </div>

          {/* Middle Column: Probabilities */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-sm font-mono text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">Simülasyon Çıktısı (n=10.000)</h3>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 mb-1">EV SAHİBİ</div>
                <div className="text-2xl font-bold text-brand-400">{simResult.homeWinProb.toFixed(1)}%</div>
              </div>
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 mb-1">BERABERLİK</div>
                <div className="text-2xl font-bold text-slate-300">{simResult.drawProb.toFixed(1)}%</div>
              </div>
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 mb-1">DEPLASMAN</div>
                <div className="text-2xl font-bold text-accent-500">{simResult.awayWinProb.toFixed(1)}%</div>
              </div>
            </div>

            <DistributionChart data={simResult.scoreDistribution} />
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-500 mb-1">2.5 ÜST</div>
                  <div className="text-xl font-bold text-white">{simResult.over25Prob.toFixed(1)}%</div>
               </div>
               <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-500 mb-1">VARYANS (VOLATİLİTE)</div>
                  <div className={`text-xl font-bold ${simResult.variance > 3 ? 'text-red-400' : 'text-green-400'}`}>
                    {simResult.variance.toFixed(2)}
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Analysis */}
          <div className="lg:col-span-3 space-y-6">
             <h3 className="text-sm font-mono text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">Gemini 3 Pro Analizi</h3>
             <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-300 shadow-inner">
               <p className="font-serif italic opacity-90">
                 "{analysis || 'Sonuçlar analiz ediliyor...'}"
               </p>
               <div className="mt-4 flex items-center gap-2">
                 <div className="h-px flex-1 bg-slate-800"></div>
                 <span className="text-[10px] uppercase text-slate-600">Muhakeme Motoru</span>
               </div>
             </div>
             
             <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
               <h4 className="text-xs text-slate-500 uppercase mb-2">Model Parametreleri</h4>
               <ul className="space-y-2 text-xs font-mono text-slate-400">
                 <li className="flex justify-between"><span>Temel Lambda:</span> <span>1.35</span></li>
                 <li className="flex justify-between"><span>Uygulanan Ağırlıklar:</span> <span>Form, Sakatlıklar</span></li>
                 <li className="flex justify-between"><span>Dağılım:</span> <span>Ağırlıklı Poisson</span></li>
                 <li className="flex justify-between"><span>Yöntem:</span> <span>Monte Carlo</span></li>
               </ul>
             </div>
          </div>

        </div>
      )}
    </div>
  );
}