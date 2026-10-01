/**
 * SEIJO58 BET - Daily 5-Token Pool & Anti-Brute Force Engine
 * 
 * 1. Daily 5-Token Pool: Generates a randomized, deterministic set of 5 secret tokens per day.
 *    Tokens from previous days automatically become invalid.
 * 2. Single-Use Protocol: Used tokens are recorded in localStorage ('used_activation_codes').
 *    Reused codes are rejected with the mandatory warning message.
 * 3. Anti-Brute Force Mechanism: 3 consecutive incorrect codes trigger a 24-hour lockout
 *    with a countdown timer.
 */

const USED_CODES_STORAGE_KEY = 'used_activation_codes';
const FAILED_ATTEMPTS_STORAGE_KEY = 'activation_failed_attempts';
const LOCKOUT_UNTIL_STORAGE_KEY = 'activation_lockout_until';
const LOCKOUT_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Hours in ms

// Suffix pool for dynamic high-entropy token generation
const SUFFIX_POOL = [
  'V', 'K', 'X', 'M', 'Z', 
  'A', 'B', 'C', 'D', 'E', 
  'F', 'G', 'H', 'J', 'P', 
  'R', 'T', 'W', 'Y', '7', 
  '8', '9', 'VIP', 'PRO', '58'
];

/**
 * Deterministic seed based on date string (YYYY-MM-DD)
 */
function getDailySeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get current date string formatted as YYYY-MM-DD
 */
export function getCurrentDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate the randomized set of 5 secret tokens for a specific day
 */
export function getTokensForDate(dateStr: string = getCurrentDateString()): string[] {
  const seed = getDailySeed(dateStr);
  const selected: string[] = [];
  
  // Deterministic shuffle selection of 5 tokens
  const pool = [...SUFFIX_POOL];
  let currentSeed = seed;

  while (selected.length < 5 && pool.length > 0) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const index = Math.floor((currentSeed / 233280) * pool.length);
    const suffix = pool.splice(index, 1)[0];
    selected.push(`SEIJO58${suffix}`);
  }

  // Ensure 5 tokens
  return selected;
}

/**
 * Get today's 5 valid secret tokens
 */
export function getTodayTokens(): string[] {
  return getTokensForDate(getCurrentDateString());
}

/**
 * Retrieve list of used activation codes from localStorage
 */
export function getUsedActivationCodes(): string[] {
  try {
    const raw = localStorage.getItem(USED_CODES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((c: string) => String(c).toUpperCase()) : [];
  } catch (e) {
    console.error('Error reading used activation codes:', e);
    return [];
  }
}

/**
 * Check if a code has already been used
 */
export function isCodeUsed(code: string): boolean {
  const clean = code.trim().toUpperCase();
  const usedCodes = getUsedActivationCodes();
  return usedCodes.includes(clean);
}

/**
 * Mark a code as used in localStorage
 */
export function markCodeAsUsed(code: string): void {
  const clean = code.trim().toUpperCase();
  const usedCodes = getUsedActivationCodes();
  if (!usedCodes.includes(clean)) {
    usedCodes.push(clean);
    try {
      localStorage.setItem(USED_CODES_STORAGE_KEY, JSON.stringify(usedCodes));
    } catch (e) {
      console.error('Error saving used code:', e);
    }
  }
}

/**
 * Get current lockout state (Anti-Brute Force)
 */
export function getLockoutStatus(): {
  isLocked: boolean;
  remainingMs: number;
  failedAttempts: number;
  lockoutUntil: number | null;
} {
  try {
    const lockoutUntilRaw = localStorage.getItem(LOCKOUT_UNTIL_STORAGE_KEY);
    const failedAttemptsRaw = localStorage.getItem(FAILED_ATTEMPTS_STORAGE_KEY);

    const lockoutUntil = lockoutUntilRaw ? parseInt(lockoutUntilRaw, 10) : null;
    const failedAttempts = failedAttemptsRaw ? parseInt(failedAttemptsRaw, 10) : 0;
    const now = Date.now();

    if (lockoutUntil && lockoutUntil > now) {
      return {
        isLocked: true,
        remainingMs: lockoutUntil - now,
        failedAttempts,
        lockoutUntil
      };
    }

    // If lockout expired, clear lockoutUntil
    if (lockoutUntil && lockoutUntil <= now) {
      localStorage.removeItem(LOCKOUT_UNTIL_STORAGE_KEY);
      localStorage.removeItem(FAILED_ATTEMPTS_STORAGE_KEY);
    }

    return {
      isLocked: false,
      remainingMs: 0,
      failedAttempts,
      lockoutUntil: null
    };
  } catch (e) {
    return {
      isLocked: false,
      remainingMs: 0,
      failedAttempts: 0,
      lockoutUntil: null
    };
  }
}

/**
 * Record a failed attempt. If 3 failed attempts in a row, trigger 24h lockout.
 */
export function recordFailedAttempt(): {
  isLocked: boolean;
  remainingMs: number;
  failedAttempts: number;
} {
  try {
    const currentStatus = getLockoutStatus();
    if (currentStatus.isLocked) {
      return currentStatus;
    }

    const newAttempts = currentStatus.failedAttempts + 1;
    localStorage.setItem(FAILED_ATTEMPTS_STORAGE_KEY, String(newAttempts));

    if (newAttempts >= 3) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(LOCKOUT_UNTIL_STORAGE_KEY, String(lockoutUntil));
      return {
        isLocked: true,
        remainingMs: LOCKOUT_DURATION_MS,
        failedAttempts: newAttempts
      };
    }

    return {
      isLocked: false,
      remainingMs: 0,
      failedAttempts: newAttempts
    };
  } catch (e) {
    return {
      isLocked: false,
      remainingMs: 0,
      failedAttempts: 1
    };
  }
}

/**
 * Reset failed attempts upon successful validation
 */
export function resetFailedAttempts(): void {
  try {
    localStorage.removeItem(FAILED_ATTEMPTS_STORAGE_KEY);
    localStorage.removeItem(LOCKOUT_UNTIL_STORAGE_KEY);
  } catch (e) {}
}

/**
 * Admin utility: Reset lockout state
 */
export function resetLockout(): void {
  try {
    localStorage.removeItem(FAILED_ATTEMPTS_STORAGE_KEY);
    localStorage.removeItem(LOCKOUT_UNTIL_STORAGE_KEY);
  } catch (e) {}
}

export const adminResetLockout = resetLockout;

/**
 * Admin utility: Clear used codes
 */
export function clearUsedTokensHistory(): void {
  try {
    localStorage.removeItem(USED_CODES_STORAGE_KEY);
  } catch (e) {}
}

export const adminClearUsedCodes = clearUsedTokensHistory;

/**
 * Get full status of daily tokens with used state
 */
export function getDailyTokensStatus(dateStr: string = getCurrentDateString()): { token: string; isUsed: boolean }[] {
  const tokens = getTokensForDate(dateStr);
  const usedCodes = getUsedActivationCodes();
  return tokens.map(token => ({
    token,
    isUsed: usedCodes.includes(token.toUpperCase())
  }));
}

/**
 * Format milliseconds into HH:MM:SS string for countdown timers
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export interface TokenValidationResult {
  success: boolean;
  message: string;
  isUsed?: boolean;
  isLocked?: boolean;
  remainingMs?: number;
  attemptsLeft?: number;
  matchedCode?: string;
}

/**
 * Master Verification Function:
 * Enforces Single-Use Protocol, Anti-Brute Force Lockout, and Daily 5-Token Pool validation.
 */
export function validateAndRedeemToken(inputCode: string): TokenValidationResult {
  // 1. Check if user is currently locked out
  const lockout = getLockoutStatus();
  if (lockout.isLocked) {
    return {
      success: false,
      isLocked: true,
      remainingMs: lockout.remainingMs,
      message: `⚠️ Sehemu ya kodi imefungwa kwa saa 24 kwa sababu ya majaribio 3 yasiyo sahihi. Subiri: ${formatCountdown(lockout.remainingMs)}`
    };
  }

  const sanitized = inputCode.trim().toUpperCase();
  if (!sanitized) {
    return {
      success: false,
      message: 'Tafadhali ingiza kodi ya uthibitisho.'
    };
  }

  // 2. Single-Use Protocol: Check if code has already been used
  if (isCodeUsed(sanitized)) {
    return {
      success: false,
      isUsed: true,
      message: '⚠️ This code has already been used! Pay TSh 1000 to get today\'s new code via WhatsApp (+255764220155).'
    };
  }

  // 3. Check against today's valid 5-Token Pool or Master Key
  const isMasterKey = sanitized === '4A2CDC58V';
  const todayTokens = getTodayTokens();
  const isValidToday = isMasterKey || todayTokens.includes(sanitized);

  if (isValidToday) {
    // Valid code: mark as used if not master and clear failed attempts
    if (!isMasterKey) {
      markCodeAsUsed(sanitized);
    }
    resetFailedAttempts();
    resetLockout();
    return {
      success: true,
      matchedCode: sanitized,
      message: '✓ Hongera! Kodi imethibitishwa na kukubaliwa kikamilifu.'
    };
  }

  // 4. Invalid Code: Record failed attempt for Anti-Brute Force
  const attemptResult = recordFailedAttempt();
  if (attemptResult.isLocked) {
    return {
      success: false,
      isLocked: true,
      remainingMs: attemptResult.remainingMs,
      message: `⚠️ Umeingiza kodi isiyo sahihi mara 3 mfululizo! Sehemu hii imefungwa kwa saa 24 (Anti-Brute Force). Muda uliobaki: ${formatCountdown(attemptResult.remainingMs)}`
    };
  }

  const attemptsLeft = 3 - attemptResult.failedAttempts;
  return {
    success: false,
    attemptsLeft,
    message: `Kodi uliyoingiza sio sahihi au muda wake wa leo umekwisha. (Majaribio yaliyobaki kabla ya kufungiwa masaa 24: ${attemptsLeft}/3). Wasiliana na Admin WhatsApp (+255 764 220 155).`
  };
}
