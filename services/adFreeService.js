import AsyncStorage from './storage';

const AD_FREE_KEY = 'ad_free_until';
const AD_FREE_DURATION_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Check if the user is currently in an ad-free session.
 * Returns true if the stored timestamp is in the future.
 */
export const isAdFree = async () => {
  try {
    const stored = await AsyncStorage.getItem(AD_FREE_KEY);
    if (!stored) return false;
    const adFreeUntil = parseInt(stored, 10);
    const remaining = adFreeUntil - Date.now();
    if (remaining > 0) {
      console.log(`[AdFree] Ad-free active. ${Math.ceil(remaining / 60000)} min remaining.`);
      return true;
    }
    return false;
  } catch (e) {
    console.error('[AdFree] isAdFree error:', e);
    return false;
  }
};

/**
 * Get remaining ad-free time in milliseconds. Returns 0 if not active.
 */
export const getAdFreeRemainingMs = async () => {
  try {
    const stored = await AsyncStorage.getItem(AD_FREE_KEY);
    if (!stored) return 0;
    const adFreeUntil = parseInt(stored, 10);
    const remaining = adFreeUntil - Date.now();
    return remaining > 0 ? remaining : 0;
  } catch (e) {
    return 0;
  }
};

/**
 * Activate the 15-minute ad-free session.
 * If a session is already active, it extends from the current time + 15 min.
 */
export const activateAdFree = async () => {
  try {
    const until = Date.now() + AD_FREE_DURATION_MS;
    await AsyncStorage.setItem(AD_FREE_KEY, String(until));
    console.log('[AdFree] Ad-free session activated for 15 minutes.');
    return until;
  } catch (e) {
    console.error('[AdFree] activateAdFree error:', e);
    return null;
  }
};

export { AD_FREE_DURATION_MS };
