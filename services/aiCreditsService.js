import AsyncStorage from './storage';

const AI_CREDITS_KEY = 'ai_credits';
const AI_CREDITS_DATE_KEY = 'ai_credits_date';
const AI_CREDITS_DEFAULT = 3;   // Minimum credits guaranteed each day
const AI_CREDITS_MAX = 10;       // Hard cap on max credits held
const AI_CREDITS_PER_AD = 3;     // Credits earned by watching a rewarded ad

/**
 * Get today's date as a YYYY-MM-DD string for daily reset checks.
 */
const getTodayString = () => new Date().toISOString().split('T')[0];

/**
 * Load and return current AI credits, resetting daily if needed.
 */
export const getAiCredits = async () => {
  try {
    const storedDate = await AsyncStorage.getItem(AI_CREDITS_DATE_KEY);
    const today = getTodayString();
    
    let currentCredits = AI_CREDITS_DEFAULT;
    const stored = await AsyncStorage.getItem(AI_CREDITS_KEY);
    if (stored !== null) {
      currentCredits = parseInt(stored, 10);
    }

    // If a new day has started, apply daily refill logic
    if (storedDate !== today) {
      await AsyncStorage.setItem(AI_CREDITS_DATE_KEY, today);
      
      // Only refill up to DEFAULT (3) if they have less than 3
      if (currentCredits < AI_CREDITS_DEFAULT) {
        currentCredits = AI_CREDITS_DEFAULT;
        await AsyncStorage.setItem(AI_CREDITS_KEY, String(currentCredits));
        console.log('[AiCredits] New day — credits refilled to', AI_CREDITS_DEFAULT);
      } else {
        console.log('[AiCredits] New day — credits kept at', currentCredits);
      }
      return currentCredits;
    }

    if (stored === null) {
      // First ever launch — initialize credits
      await AsyncStorage.setItem(AI_CREDITS_DATE_KEY, today);
      await AsyncStorage.setItem(AI_CREDITS_KEY, String(AI_CREDITS_DEFAULT));
      return AI_CREDITS_DEFAULT;
    }

    return currentCredits;
  } catch (e) {
    console.error('[AiCredits] getAiCredits error:', e);
    return AI_CREDITS_DEFAULT;
  }
};

/**
 * Deduct 1 credit. Returns true if successful, false if no credits left.
 */
export const deductAiCredit = async () => {
  try {
    const current = await getAiCredits();
    if (current <= 0) {
      console.log('[AiCredits] No credits left.');
      return false;
    }
    await AsyncStorage.setItem(AI_CREDITS_KEY, String(current - 1));
    console.log('[AiCredits] Credit deducted. Remaining:', current - 1);
    return true;
  } catch (e) {
    console.error('[AiCredits] deductAiCredit error:', e);
    return false;
  }
};

/**
 * Add credits earned from watching a rewarded ad. Capped at AI_CREDITS_MAX.
 * Returns the new credit count.
 */
export const addCreditsFromAd = async () => {
  try {
    const current = await getAiCredits();
    const newCount = Math.min(current + AI_CREDITS_PER_AD, AI_CREDITS_MAX);
    await AsyncStorage.setItem(AI_CREDITS_KEY, String(newCount));
    console.log('[AiCredits] Credits added from ad. New total:', newCount);
    return newCount;
  } catch (e) {
    console.error('[AiCredits] addCreditsFromAd error:', e);
    return 0;
  }
};

export { AI_CREDITS_DEFAULT, AI_CREDITS_MAX, AI_CREDITS_PER_AD };
