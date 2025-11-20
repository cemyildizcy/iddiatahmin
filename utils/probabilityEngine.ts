import { MatchParameters, SimulationResult } from '../types';

/**
 * Mathematical Core: ProbabilityEngine
 * Implements Weighted Poisson Distribution and Monte Carlo Simulation.
 */
export class ProbabilityEngine {
  private SIMULATION_COUNT = 10000;

  /**
   * Calculates the weighted Lambda (Expected Goals) for a team against an opponent.
   * 
   * Formula:
   * λ_final = λ_base * W_form * W_weather * W_missing_players * (Attack / OpponentDefense)
   */
  private calculateWeightedLambda(
    attacker: { attackStrength: number; recentForm: number; injuryImpact: number },
    defender: { defenseStrength: number },
    weatherFactor: number
  ): number {
    const BASE_GOALS_AVG = 1.35; // League average goals per game per team

    // W_form: Sigmoid-like scaling around 1.0 based on 0-100 form
    const w_form = 0.8 + (attacker.recentForm / 100) * 0.4; 

    // W_strength: Ratio of Attack vs Defense
    const w_strength = attacker.attackStrength / Math.max(defender.defenseStrength, 50);

    // W_missing: Direct multiplier (e.g., 0.9 if 10% star power missing)
    const w_missing = attacker.injuryImpact;

    // λ calculation
    let lambda = BASE_GOALS_AVG * w_strength * w_form * w_missing * weatherFactor;

    return Math.max(0.1, lambda); // Minimum floor
  }

  /**
   * Generates a random number from a Poisson distribution with parameter lambda.
   * Uses Knuth's algorithm.
   */
  private poissonRandom(lambda: number): number {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return k - 1;
  }

  /**
   * Runs the Monte Carlo Simulation.
   */
  public runMonteCarlo(params: MatchParameters): SimulationResult {
    const { teamA, teamB, weatherFactor } = params;

    const lambdaA = this.calculateWeightedLambda(teamA, teamB, weatherFactor);
    const lambdaB = this.calculateWeightedLambda(teamB, teamA, weatherFactor);

    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    let over25Count = 0;
    const scoreMap = new Map<string, number>();
    
    // Variance tracking for total goals
    const totalGoalsHistory: number[] = [];

    for (let i = 0; i < this.SIMULATION_COUNT; i++) {
      const goalsA = this.poissonRandom(lambdaA);
      const goalsB = this.poissonRandom(lambdaB);

      // Update Outcomes
      if (goalsA > goalsB) homeWins++;
      else if (goalsA === goalsB) draws++;
      else awayWins++;

      // Over/Under
      const totalGoals = goalsA + goalsB;
      if (totalGoals > 2.5) over25Count++;
      totalGoalsHistory.push(totalGoals);

      // Scoreline tracking
      const scoreKey = `${goalsA}-${goalsB}`;
      scoreMap.set(scoreKey, (scoreMap.get(scoreKey) || 0) + 1);
    }

    // Calculate Statistics
    const homeWinProb = (homeWins / this.SIMULATION_COUNT) * 100;
    const drawProb = (draws / this.SIMULATION_COUNT) * 100;
    const awayWinProb = (awayWins / this.SIMULATION_COUNT) * 100;
    const over25Prob = (over25Count / this.SIMULATION_COUNT) * 100;

    // Calculate Variance (Surprise Factor)
    const meanGoals = totalGoalsHistory.reduce((a, b) => a + b, 0) / this.SIMULATION_COUNT;
    const variance = totalGoalsHistory.reduce((a, b) => a + Math.pow(b - meanGoals, 2), 0) / this.SIMULATION_COUNT;

    // Sort Scorelines
    const sortedScores = Array.from(scoreMap.entries())
      .map(([score, count]) => ({ score, count, prob: (count / this.SIMULATION_COUNT) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 scores

    return {
      homeWinProb,
      drawProb,
      awayWinProb,
      over25Prob,
      variance,
      mostLikelyScore: sortedScores[0].score,
      scoreDistribution: sortedScores,
      totalSimulations: this.SIMULATION_COUNT
    };
  }
}
