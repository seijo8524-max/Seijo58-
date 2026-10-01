/**
 * SEIJO58 WITHDRAWAL RESTRICTIONS & VALIDATION GUARD
 * 
 * Strict withdrawal rules & conditions:
 * 1. 5-Day App Account Tenure Requirement (Siku 5 Kwenye App):
 *    - Tracks exact registration/activation date in localStorage.
 *    - Minimum 5 days (120 hours) tenure required before withdrawal.
 *    - Warning: "⚠️ Huwezi kutoa fedha mpaka akaunti yako ifikishe siku 5 tangu ujisajili. Bado siku [X]!"
 * 
 * 2. Minimum 3 Games Played Requirement (Acheze Michezo 3):
 *    - Tracks total bets/games placed across the app (Casino, Crash, eFootball, Outright).
 *    - Minimum 3 games required to qualify for withdrawal.
 *    - Warning: "⚠️ Ili kutoa fedha, lazima uwe umecheza angalau michezo 3 kwenye app. Umecheza michezo [X]/3."
 * 
 * 3. Status Display & Button Gate:
 *    - 📅 Umri wa Akaunti: Siku [X] / 5 (🟢 Au 🔴)
 *    - 🎮 Michezo Uliyocheza: [X] / 3 (🟢 Au 🔴)
 *    - Button "THIBITISHA KUTOA ELA" enabled ONLY when both conditions are 🟢.
 */

export const WITHDRAWAL_TENURE_DAYS = 5;
export const WITHDRAWAL_TENURE_MS = WITHDRAWAL_TENURE_DAYS * 24 * 60 * 60 * 1000;
export const WITHDRAWAL_MIN_GAMES = 4;
export const MAX_DAILY_WITHDRAWAL_AMOUNT = 5000;
export const MIN_REGISTRATION_DEPOSIT = 3000;

export function getTodayDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLastWithdrawalDate(identifier?: string | null): string | null {
  const userKey = getCleanUserKey(identifier);
  try {
    return localStorage.getItem(`seijo58_last_withdrawal_date_${userKey}`) || 
           localStorage.getItem('seijo58_last_withdrawal_date') || 
           null;
  } catch (e) {
    return null;
  }
}

export function recordSuccessfulWithdrawal(identifier?: string | null): string {
  const userKey = getCleanUserKey(identifier);
  const todayStr = getTodayDateString();
  try {
    localStorage.setItem(`seijo58_last_withdrawal_date_${userKey}`, todayStr);
    localStorage.setItem('seijo58_last_withdrawal_date', todayStr);
    window.dispatchEvent(new CustomEvent('seijo58_withdrawal_recorded', { detail: { userKey, date: todayStr } }));
  } catch (e) {}
  return todayStr;
}

export function hasWithdrawnToday(identifier?: string | null): boolean {
  const lastDate = getLastWithdrawalDate(identifier);
  if (!lastDate) return false;
  return lastDate === getTodayDateString();
}

export function getCleanUserKey(identifier?: string | null): string {
  if (!identifier) return 'guest';
  const clean = identifier.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  return clean || 'guest';
}

/**
 * Gets or initializes the user registration timestamp
 */
export function getAccountRegistrationTimestamp(
  identifier?: string | null,
  profileCreatedAt?: string | null
): number {
  const userKey = getCleanUserKey(identifier);
  const userSpecificKey = `seijo58_user_reg_time_${userKey}`;
  const legacyUserKey = `seijo58_reg_time_${userKey}`;

  // 1. Check user-specific localStorage key
  try {
    const saved = localStorage.getItem(userSpecificKey) || localStorage.getItem(legacyUserKey);
    if (saved) {
      const parsed = Number(saved);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch (e) {}

  // 2. Check profile createdAt if available
  if (profileCreatedAt) {
    try {
      const parsed = new Date(profileCreatedAt).getTime();
      if (!isNaN(parsed) && parsed > 0) {
        localStorage.setItem(userSpecificKey, parsed.toString());
        return parsed;
      }
    } catch (e) {}
  }

  // 3. Fallback to generic registration key
  try {
    const general = localStorage.getItem('seijo58_user_reg_time');
    if (general) {
      const parsed = Number(general);
      if (!isNaN(parsed) && parsed > 0) {
        localStorage.setItem(userSpecificKey, parsed.toString());
        return parsed;
      }
    }
  } catch (e) {}

  // 4. Record current timestamp as registration time
  const now = Date.now();
  try {
    localStorage.setItem(userSpecificKey, now.toString());
    localStorage.setItem('seijo58_user_reg_time', now.toString());
  } catch (e) {}

  return now;
}

/**
 * Calculate tenure days and remaining lock time
 */
export function getAccountTenureInfo(
  identifier?: string | null,
  profileCreatedAt?: string | null
) {
  const regTimestamp = getAccountRegistrationTimestamp(identifier, profileCreatedAt);
  const now = Date.now();
  const unlockTimestamp = regTimestamp + WITHDRAWAL_TENURE_MS;
  const isTenureEligible = now >= unlockTimestamp;

  const elapsedMs = Math.max(0, now - regTimestamp);
  const tenureDays = Math.min(
    WITHDRAWAL_TENURE_DAYS,
    Math.floor(elapsedMs / (24 * 60 * 60 * 1000))
  );

  const remainingMs = Math.max(0, unlockTimestamp - now);
  // Ceiling of remaining days so 4.2 days left shows as 5 days remaining, 0.5 days left shows as 1 day remaining
  const remainingDays = isTenureEligible
    ? 0
    : Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

  const remainingHours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const remainingMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  const remainingSeconds = Math.floor((remainingMs % (60 * 1000)) / 1000);

  const unlockDate = new Date(unlockTimestamp);

  return {
    regTimestamp,
    unlockTimestamp,
    isTenureEligible,
    tenureDays,
    remainingDays,
    remainingHours,
    remainingMinutes,
    remainingSeconds,
    unlockDate,
    warningMessage: `⚠️ Huwezi kutoa fedha mpaka akaunti yako ifikishe siku 5. Bado siku ${remainingDays}!`
  };
}

/**
 * Gets total games/bets played by this user across the entire app
 */
export function getUserGamesPlayedCount(identifier?: string | null): number {
  const userKey = getCleanUserKey(identifier);
  const storageKey = `seijo58_user_games_count_${userKey}`;
  const altKey = `seijo58_games_played_${userKey}`;

  let explicitCount = 0;
  try {
    const val = localStorage.getItem(storageKey) || localStorage.getItem(altKey);
    if (val) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed >= 0) explicitCount = parsed;
    }
  } catch (e) {}

  // Cross-reference with betHistory
  let casinoBetsCount = 0;
  try {
    const histKey = `seijo58_user_bet_history_${userKey}`;
    const rawHist = localStorage.getItem(histKey) || localStorage.getItem('seijo58_casino_history');
    if (rawHist) {
      const parsed = JSON.parse(rawHist);
      if (Array.isArray(parsed)) casinoBetsCount = parsed.length;
    }
  } catch (e) {}

  // Cross-reference with eFootball tickets
  let ticketsCount = 0;
  try {
    const rawTickets = localStorage.getItem('seijo58_efootball_tickets');
    if (rawTickets) {
      const parsed = JSON.parse(rawTickets);
      if (Array.isArray(parsed)) {
        ticketsCount = parsed.filter((t: any) => {
          if (!identifier || identifier === 'guest') return true;
          const matchEmail = t.userEmail && t.userEmail.toLowerCase() === identifier.toLowerCase();
          const matchId = t.userId && t.userId === identifier;
          return matchEmail || matchId;
        }).length;
      }
    }
  } catch (e) {}

  const trueCount = Math.max(explicitCount, casinoBetsCount + ticketsCount);

  // Sync if trueCount exceeds stored
  if (trueCount > explicitCount) {
    try {
      localStorage.setItem(storageKey, trueCount.toString());
      localStorage.setItem(altKey, trueCount.toString());
    } catch (e) {}
  }

  return trueCount;
}

/**
 * Increment games played count whenever any bet is placed
 */
export function recordGamePlayed(identifier?: string | null): number {
  const userKey = getCleanUserKey(identifier);
  const currentCount = getUserGamesPlayedCount(identifier);
  const newCount = currentCount + 1;

  try {
    localStorage.setItem(`seijo58_user_games_count_${userKey}`, newCount.toString());
    localStorage.setItem(`seijo58_games_played_${userKey}`, newCount.toString());
    localStorage.setItem('seijo58_total_games_played', newCount.toString());

    // Dispatch global event for live UI update
    window.dispatchEvent(
      new CustomEvent('seijo58_game_played', {
        detail: { userKey, count: newCount }
      })
    );
  } catch (e) {}

  return newCount;
}

/**
 * Full Withdrawal Eligibility Evaluator (All 4 conditions)
 */
export function getWithdrawalEligibility(
  identifier?: string | null,
  profileCreatedAt?: string | null,
  requestedAmount: number = 0
) {
  const tenure = getAccountTenureInfo(identifier, profileCreatedAt);
  const gamesPlayedCount = getUserGamesPlayedCount(identifier);
  const isGamesEligible = gamesPlayedCount >= WITHDRAWAL_MIN_GAMES;
  const isDailyLimitEligible = !hasWithdrawnToday(identifier);
  const isAmountEligible = requestedAmount <= MAX_DAILY_WITHDRAWAL_AMOUNT;
  
  // All 4 status conditions must be satisfied
  const isCanWithdraw = tenure.isTenureEligible && isGamesEligible && isDailyLimitEligible && (requestedAmount === 0 || isAmountEligible);

  const tenureWarning = `⚠️ Huwezi kutoa fedha mpaka akaunti yako ifikishe siku 5. Bado siku ${tenure.remainingDays}!`;
  const gamesWarning = `⚠️ Lazima uwe umecheza angalau michezo 4 kwenye app kabla ya kutoa fedha. Umecheza michezo ${gamesPlayedCount}/4.`;
  const dailyLimitWarning = `⚠️ Umeshatoa fedha leo! Unaweza kutoa tena kesho.`;
  const amountWarning = `⚠️ Kiwango cha juu cha kutoa fedha kwa siku ni TSh 5,000 tu!`;

  return {
    isTenureEligible: tenure.isTenureEligible,
    isGamesEligible,
    isDailyLimitEligible,
    isAmountEligible,
    isCanWithdraw,
    tenureDays: tenure.tenureDays,
    remainingDays: tenure.remainingDays,
    remainingHours: tenure.remainingHours,
    remainingMinutes: tenure.remainingMinutes,
    remainingSeconds: tenure.remainingSeconds,
    unlockDate: tenure.unlockDate,
    gamesPlayedCount,
    minGamesRequired: WITHDRAWAL_MIN_GAMES,
    maxDailyAmount: MAX_DAILY_WITHDRAWAL_AMOUNT,
    tenureWarning,
    gamesWarning,
    dailyLimitWarning,
    amountWarning
  };
}

// Expose on window for runtime console inspection and script parity
if (typeof window !== 'undefined') {
  (window as any).SeijoWithdrawalGuard = {
    getEligibility: getWithdrawalEligibility,
    recordGame: recordGamePlayed,
    getGames: getUserGamesPlayedCount,
    getTenure: getAccountTenureInfo,
    recordWithdrawal: recordSuccessfulWithdrawal,
    hasWithdrawnToday: hasWithdrawnToday,
    getLastWithdrawalDate: getLastWithdrawalDate
  };
}
