// SEIJO58 GRAND FINAL (FAINALI KUU) 22:00 DEADLINE & AUTO-LOCK ENGINE
// OFFICIAL DEADLINE: TONIGHT AT 22:00 (SAA 4:00 USIKU)
// MATCH: ISAAC 🆚 MAN U

export const FINAL_LOCK_STORAGE_KEY = 'seijo58_final_betting_locked';
export const FINAL_CUTOFF_STORAGE_KEY = 'seijo58_final_cutoff_time';
export const FINAL_TARGET_HOUR = 22; // Saa 4:00 Usiku (22:00)
export const FINAL_TARGET_MINUTE = 0;

// Backward-compatible exports
export const QF_LOCK_STORAGE_KEY = FINAL_LOCK_STORAGE_KEY;
export const QF_CUTOFF_STORAGE_KEY = FINAL_CUTOFF_STORAGE_KEY;
export const QF_TARGET_HOUR = FINAL_TARGET_HOUR;
export const QF_TARGET_MINUTE = FINAL_TARGET_MINUTE;

/**
 * Returns the exact cutoff timestamp (ms) for Grand Final betting.
 * Deadline is strictly set to Tonight at 22:00 (Saa 4:00 Usiku).
 */
export function getGrandFinalCutoffTimestamp(): number {
  try {
    const isLockedFlag = localStorage.getItem(FINAL_LOCK_STORAGE_KEY) === 'true';
    if (isLockedFlag) {
      const saved = localStorage.getItem(FINAL_CUTOFF_STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }
    }

    const saved = localStorage.getItem(FINAL_CUTOFF_STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) {
        if (parsed > Date.now()) {
          return parsed;
        } else {
          localStorage.setItem(FINAL_LOCK_STORAGE_KEY, 'true');
          return parsed;
        }
      }
    }
  } catch (e) {}

  // Calculate Tonight at 22:00:00 (Saa 4:00 Usiku)
  const target = new Date();
  target.setHours(FINAL_TARGET_HOUR, FINAL_TARGET_MINUTE, 0, 0);

  // If already past 22:00 tonight, lock strictly
  if (Date.now() >= target.getTime()) {
    try {
      localStorage.setItem(FINAL_LOCK_STORAGE_KEY, 'true');
      localStorage.setItem(FINAL_CUTOFF_STORAGE_KEY, String(target.getTime()));
    } catch (e) {}
    return target.getTime();
  }

  const cutoffTime = target.getTime();
  try {
    localStorage.setItem(FINAL_CUTOFF_STORAGE_KEY, String(cutoffTime));
    localStorage.removeItem(FINAL_LOCK_STORAGE_KEY);
  } catch (e) {}

  return cutoffTime;
}

export const getQuarterFinalsCutoffTimestamp = getGrandFinalCutoffTimestamp;

/**
 * Checks if Grand Final betting is strictly locked.
 * Once the clock hits 22:00, all odds buttons are disabled: "🔒 FAINALI IMEANZA! Soko limefungwa."
 */
export function isGrandFinalLocked(): boolean {
  try {
    const isLockedFlag = localStorage.getItem(FINAL_LOCK_STORAGE_KEY) === 'true';
    if (isLockedFlag) {
      return true;
    }

    const cutoff = getGrandFinalCutoffTimestamp();
    const now = Date.now();

    if (now >= cutoff) {
      localStorage.setItem(FINAL_LOCK_STORAGE_KEY, 'true');
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

export const isQuarterFinalsLocked = isGrandFinalLocked;

/**
 * Live Countdown calculation down to Tonight 22:00 (Saa 4:00 Usiku)
 */
export function getGrandFinalCountdown(): {
  hours: string;
  minutes: string;
  seconds: string;
  totalSeconds: number;
  isLocked: boolean;
} {
  const locked = isGrandFinalLocked();
  if (locked) {
    return {
      hours: '00',
      minutes: '00',
      seconds: '00',
      totalSeconds: 0,
      isLocked: true
    };
  }

  const cutoff = getGrandFinalCutoffTimestamp();
  const now = Date.now();
  const diffMs = cutoff - now;

  if (diffMs <= 0) {
    try {
      localStorage.setItem(FINAL_LOCK_STORAGE_KEY, 'true');
    } catch (e) {}
    return {
      hours: '00',
      minutes: '00',
      seconds: '00',
      totalSeconds: 0,
      isLocked: true
    };
  }

  const totalSec = Math.floor(diffMs / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  return {
    hours: String(hrs).padStart(2, '0'),
    minutes: String(mins).padStart(2, '0'),
    seconds: String(secs).padStart(2, '0'),
    totalSeconds: totalSec,
    isLocked: false
  };
}

export const getQuarterFinalsCountdown = getGrandFinalCountdown;

/**
 * Admin lock/unlock control
 */
export function setGrandFinalLockByAdmin(locked: boolean) {
  try {
    localStorage.setItem(FINAL_LOCK_STORAGE_KEY, locked ? 'true' : 'false');
    if (!locked) {
      const now = Date.now();
      const cutoff = getGrandFinalCutoffTimestamp();
      if (now >= cutoff) {
        const next = new Date();
        next.setHours(FINAL_TARGET_HOUR, FINAL_TARGET_MINUTE, 0, 0);
        if (next.getTime() <= now) {
          next.setDate(next.getDate() + 1);
        }
        localStorage.setItem(FINAL_CUTOFF_STORAGE_KEY, String(next.getTime()));
      }
    }
    window.dispatchEvent(new CustomEvent('seijo58_final_lock_changed', { detail: { isLocked: locked } }));
    window.dispatchEvent(new CustomEvent('seijo58_qf_lock_changed', { detail: { isLocked: locked } }));
  } catch (e) {}
}

export const setQuarterFinalsLockByAdmin = setGrandFinalLockByAdmin;

/**
 * Resets the Grand Final cutoff to Tonight 22:00 (Saa 4:00 Usiku)
 */
export function resetGrandFinalCutoff() {
  try {
    const target = new Date();
    target.setHours(FINAL_TARGET_HOUR, FINAL_TARGET_MINUTE, 0, 0);
    if (target.getTime() <= Date.now()) {
      target.setDate(target.getDate() + 1);
    }
    localStorage.setItem(FINAL_CUTOFF_STORAGE_KEY, String(target.getTime()));
    localStorage.removeItem(FINAL_LOCK_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('seijo58_final_lock_changed', { detail: { isLocked: false } }));
    window.dispatchEvent(new CustomEvent('seijo58_qf_lock_changed', { detail: { isLocked: false } }));
  } catch (e) {}
}

export const resetQuarterFinalsCutoff = resetGrandFinalCutoff;

