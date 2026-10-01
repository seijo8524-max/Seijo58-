import { MarketOdds, MatchTip } from '../types';

export interface SimulationTeam {
  name: string;
  country: string;
  league: string;
  attackRating: number; // 60-99
  defenseRating: number; // 60-99
  formScore: number; // 1-10
}

export const POPULAR_TEAMS: SimulationTeam[] = [
  { name: 'Real Madrid', country: 'Spain', league: 'La Liga', attackRating: 94, defenseRating: 88, formScore: 9 },
  { name: 'Manchester City', country: 'England', league: 'Premier League', attackRating: 95, defenseRating: 90, formScore: 9 },
  { name: 'Arsenal', country: 'England', league: 'Premier League', attackRating: 91, defenseRating: 92, formScore: 8.5 },
  { name: 'Barcelona', country: 'Spain', league: 'La Liga', attackRating: 93, defenseRating: 85, formScore: 8.8 },
  { name: 'Bayern Munich', country: 'Germany', league: 'Bundesliga', attackRating: 94, defenseRating: 86, formScore: 8.7 },
  { name: 'Liverpool', country: 'England', league: 'Premier League', attackRating: 92, defenseRating: 89, formScore: 9.1 },
  { name: 'Inter Milan', country: 'Italy', league: 'Serie A', attackRating: 89, defenseRating: 91, formScore: 8.4 },
  { name: 'Paris Saint-Germain', country: 'France', league: 'Ligue 1', attackRating: 90, defenseRating: 84, formScore: 8.2 },
  { name: 'Bayer Leverkusen', country: 'Germany', league: 'Bundesliga', attackRating: 90, defenseRating: 87, formScore: 8.6 },
  { name: 'Chelsea', country: 'England', league: 'Premier League', attackRating: 87, defenseRating: 83, formScore: 7.8 },
  { name: 'Juventus', country: 'Italy', league: 'Serie A', attackRating: 84, defenseRating: 90, formScore: 8.1 },
  { name: 'Al Ahly SC', country: 'Egypt', league: 'CAF Champions League', attackRating: 88, defenseRating: 89, formScore: 9.0 },
  { name: 'Mamelodi Sundowns', country: 'South Africa', league: 'CAF Champions League', attackRating: 85, defenseRating: 84, formScore: 8.5 },
  { name: 'Al Nassr', country: 'Saudi Arabia', league: 'Saudi Pro League', attackRating: 89, defenseRating: 80, formScore: 8.3 },
];

/**
 * Professional Poisson / Logistic Inspired Odds Calculation Algorithm
 */
export function calculateMatchOdds(home: SimulationTeam, away: SimulationTeam): {
  marketOdds: MarketOdds;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
  bestTip: {
    type: string;
    selection: string;
    odds: number;
    confidence: number;
    reasoning: string;
  };
} {
  // Home ground advantage factor
  const HOME_ADVANTAGE = 1.14;

  // Expected goals (xG) calculation
  const homeAttackVsAwayDef = (home.attackRating / (away.defenseRating || 70)) * 1.35 * HOME_ADVANTAGE;
  const awayAttackVsHomeDef = (away.attackRating / (home.defenseRating || 70)) * 1.05;

  const predictedHomeGoals = Math.max(0.6, parseFloat(homeAttackVsAwayDef.toFixed(2)));
  const predictedAwayGoals = Math.max(0.4, parseFloat(awayAttackVsHomeDef.toFixed(2)));

  // Probabilities calculation using synthetic Poisson approximations
  const totalGoalExpectancy = predictedHomeGoals + predictedAwayGoals;
  const strengthDiff = home.attackRating + home.defenseRating * 0.5 - (away.attackRating + away.defenseRating * 0.5);

  let rawHomeProb = 0.38 + (strengthDiff * 0.012) + 0.08;
  let rawAwayProb = 0.32 - (strengthDiff * 0.010);
  let rawDrawProb = 0.30 - Math.abs(strengthDiff * 0.004);

  // Normalize
  const totalProb = rawHomeProb + rawAwayProb + rawDrawProb;
  rawHomeProb = Math.min(0.85, Math.max(0.12, rawHomeProb / totalProb));
  rawAwayProb = Math.min(0.80, Math.max(0.10, rawAwayProb / totalProb));
  rawDrawProb = Math.min(0.35, Math.max(0.18, 1 - (rawHomeProb + rawAwayProb)));

  // Bookmaker margin (5-7%)
  const margin = 1.06;
  const homeWinOdds = parseFloat((margin / rawHomeProb).toFixed(2));
  const drawOdds = parseFloat((margin / rawDrawProb).toFixed(2));
  const awayWinOdds = parseFloat((margin / rawAwayProb).toFixed(2));

  // Over/Under 2.5 calculation
  const probOver25 = Math.min(0.82, Math.max(0.35, 0.50 + (totalGoalExpectancy - 2.5) * 0.22));
  const probUnder25 = 1 - probOver25;
  const over25Odds = parseFloat((margin / probOver25).toFixed(2));
  const under25Odds = parseFloat((margin / probUnder25).toFixed(2));

  // Both Teams To Score (BTTS)
  const homeScoreProb = 1 - Math.exp(-predictedHomeGoals);
  const awayScoreProb = 1 - Math.exp(-predictedAwayGoals);
  const bttsYesProb = Math.min(0.78, Math.max(0.38, homeScoreProb * awayScoreProb * 1.15));
  const bttsYesOdds = parseFloat((margin / bttsYesProb).toFixed(2));
  const bttsNoOdds = parseFloat((margin / (1 - bttsYesProb)).toFixed(2));

  // Double Chance
  const doubleChance1X = parseFloat((margin / (rawHomeProb + rawDrawProb)).toFixed(2));
  const doubleChanceX2 = parseFloat((margin / (rawAwayProb + rawDrawProb)).toFixed(2));
  const doubleChance12 = parseFloat((margin / (rawHomeProb + rawAwayProb)).toFixed(2));

  // Determine algorithm best value pick
  let tipType = '1X2';
  let tipSelection = `${home.name} to Win`;
  let tipOdds = homeWinOdds;
  let tipConfidence = Math.min(94, Math.round(rawHomeProb * 100 + 10));
  let reasoning = `${home.name} offensive rating (${home.attackRating}) provides solid mathematical edge against ${away.name}.`;

  if (rawHomeProb > 0.65) {
    tipType = '1X2 & Match Goal';
    tipSelection = `${home.name} to Win`;
    tipOdds = homeWinOdds;
    tipConfidence = Math.min(95, Math.round(rawHomeProb * 100 + 12));
    reasoning = `High home win expectation (${Math.round(rawHomeProb * 100)}% win likelihood) at home fortress.`;
  } else if (probOver25 > 0.62) {
    tipType = 'Over/Under Goals';
    tipSelection = 'Over 2.5 Match Goals';
    tipOdds = over25Odds;
    tipConfidence = Math.min(92, Math.round(probOver25 * 100 + 8));
    reasoning = `Projected total match goals xG is ${totalGoalExpectancy.toFixed(2)}, pointing to an open high-scoring encounter.`;
  } else if (bttsYesProb > 0.58) {
    tipType = 'Both Teams To Score';
    tipSelection = 'BTTS - YES';
    tipOdds = bttsYesOdds;
    tipConfidence = Math.min(90, Math.round(bttsYesProb * 100 + 10));
    reasoning = `Both squads demonstrate high attacking conversion with vulnerable defensive transitions.`;
  } else if (rawHomeProb + rawDrawProb > 0.78) {
    tipType = 'Double Chance Safe';
    tipSelection = `${home.name} Win or Draw (1X)`;
    tipOdds = doubleChance1X;
    tipConfidence = 93;
    reasoning = `Safe banker statistical model: 1X covers over 80% of computed match outcomes.`;
  }

  const marketOdds: MarketOdds = {
    homeWin: homeWinOdds,
    draw: drawOdds,
    awayWin: awayWinOdds,
    over25: over25Odds,
    under25: under25Odds,
    over15: parseFloat((1.05 / (probOver25 + 0.25)).toFixed(2)),
    bttsYes: bttsYesOdds,
    bttsNo: bttsNoOdds,
    doubleChance1X: Math.max(1.10, doubleChance1X),
    doubleChanceX2: Math.max(1.15, doubleChanceX2),
    doubleChance12: Math.max(1.14, doubleChance12),
    correctScore: {
      '2-1': parseFloat((7.5 + (1 - rawHomeProb) * 6).toFixed(1)),
      '2-0': parseFloat((6.8 + (1 - rawHomeProb) * 5).toFixed(1)),
      '1-1': parseFloat((6.5 + (1 - rawDrawProb) * 5).toFixed(1)),
      '3-1': parseFloat((11.0 + (1 - rawHomeProb) * 8).toFixed(1)),
    }
  };

  return {
    marketOdds,
    predictedHomeGoals,
    predictedAwayGoals,
    bestTip: {
      type: tipType,
      selection: tipSelection,
      odds: tipOdds,
      confidence: tipConfidence,
      reasoning
    }
  };
}

export function generateCustomMatchTip(
  homeTeamName: string,
  awayTeamName: string,
  leagueName: string = 'International Elite Cup'
): MatchTip {
  const home = POPULAR_TEAMS.find(t => t.name.toLowerCase() === homeTeamName.toLowerCase()) || {
    name: homeTeamName,
    country: 'Global',
    league: leagueName,
    attackRating: 86,
    defenseRating: 82,
    formScore: 8.0,
  };

  const away = POPULAR_TEAMS.find(t => t.name.toLowerCase() === awayTeamName.toLowerCase()) || {
    name: awayTeamName,
    country: 'Global',
    league: leagueName,
    attackRating: 83,
    defenseRating: 81,
    formScore: 7.5,
  };

  const calculation = calculateMatchOdds(home, away);

  return {
    id: `custom-sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    league: leagueName,
    leagueCountry: home.country || 'Europe',
    leagueBadge: '⚡',
    homeTeam: home.name,
    awayTeam: away.name,
    matchDate: 'AI Generated Match',
    matchTime: '20:30 GMT',
    status: 'upcoming',
    isVIP: false,
    category: 'free',
    isBanker: calculation.bestTip.confidence >= 90,
    predictionType: calculation.bestTip.type,
    predictionSelection: calculation.bestTip.selection,
    odds: calculation.bestTip.odds,
    confidence: calculation.bestTip.confidence,
    marketOdds: calculation.marketOdds,
    aiAnalysis: `SEIJO58 BET AI Model: ${calculation.bestTip.reasoning} Simulated score trajectory: ${calculation.predictedHomeGoals.toFixed(1)} - ${calculation.predictedAwayGoals.toFixed(1)}.`,
    keyInsights: [
      `xG Expectancy: ${calculation.predictedHomeGoals.toFixed(2)} vs ${calculation.predictedAwayGoals.toFixed(2)}`,
      `Optimal Value Market: ${calculation.bestTip.selection} @ ${calculation.bestTip.odds.toFixed(2)}`,
      `Confidence Rating: ${calculation.bestTip.confidence}%`
    ],
    h2hSummary: `${home.name} Form Rating: ${home.formScore}/10 | ${away.name} Form: ${away.formScore}/10`,
    homeForm: ['W', 'W', 'D', 'W', 'W'],
    awayForm: ['W', 'L', 'W', 'D', 'W'],
  };
}

/**
 * Formats odds multiplier with 2 decimals
 */
export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

/**
 * Calculates total accumulator multiplier
 */
export function calculateAccumulatorOdds(oddsList: number[]): number {
  if (!oddsList.length) return 0;
  const total = oddsList.reduce((acc, curr) => acc * curr, 1);
  return parseFloat(total.toFixed(2));
}

/**
 * Calculates potential payout
 */
export function calculatePayout(stake: number, totalOdds: number): number {
  return parseFloat((stake * totalOdds).toFixed(2));
}
