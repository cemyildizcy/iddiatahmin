// Simulation Types
export interface TeamStats {
  name: string;
  recentForm: number; // 0-100 scale based on last 5 games
  attackStrength: number; // 0-200 scale (100 is avg)
  defenseStrength: number; // 0-200 scale (100 is avg)
  injuryImpact: number; // 0.0 to 1.0 (percentage of strength available)
  missingKeyPlayers: string[];
  last5Matches: string[]; // Descriptions
}

export interface MatchParameters {
  teamA: TeamStats;
  teamB: TeamStats;
  weatherFactor: number; // 0.9 (bad) to 1.1 (good)
  refereeStrictness: number; // 0 (lenient) to 10 (strict)
}

export interface SimulationResult {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  over25Prob: number;
  variance: number; // Volatility measure
  mostLikelyScore: string;
  scoreDistribution: { score: string; count: number; prob: number }[];
  totalSimulations: number;
}

// API Types
export interface ScrapedData {
  teamA: TeamStats;
  teamB: TeamStats;
  weatherForecast: string;
  tacticalAnalysis: string;
}
