export type EFootballTicketStatus = 'PENDING' | 'WON' | 'LOST';

export interface EFootballBetSelection {
  matchId: string;
  matchTitle: string;
  stageName: string;
  marketType: string;
  marketName: string;
  selection: string;
  odds: number;
}

export interface EFootballTicket {
  id: string; // e.g. "MK-589201"
  userId?: string; // Logged-in user UID who explicitly placed the ticket
  userEmail?: string; // User email who explicitly placed the ticket
  createdAt: string;
  kickoffTime: string;
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  status: EFootballTicketStatus;
  selections: EFootballBetSelection[];
  settled?: boolean;
  paidOut?: boolean;
  credited?: boolean;
  settledAt?: string;
  outcomeNotes?: string;
}

export interface MatchSimulatedResult {
  matchId: string;
  homeScore: number;
  awayScore: number;
  winningOutcome1X2: '1' | 'X' | '2';
  totalGoalsOU55: 'Over 5.5 Goals' | 'Under 5.5 Goals';
  bttsResult: 'GG (Both Teams Score)' | 'NG (No Goal)';
}
