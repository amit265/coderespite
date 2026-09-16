import AsyncStorage from "./storage";

export const BADGES = {
  // --- Streaks ---
  STREAK_3: { id: "STREAK_3", title: "Spark 🔥", desc: "Maintained a 3-day coding streak!", emoji: "🔥", message: "I just unlocked the 'Spark' badge on CodeRespite for a 3-day streak! 🔥 https://destyastudio.com/products/code-respite" },
  STREAK_7: { id: "STREAK_7", title: "Flame 🎇", desc: "Maintained a 7-day coding streak!", emoji: "🎇", message: "I just unlocked the 'Flame' badge on CodeRespite for a 7-day streak! 🎇 https://destyastudio.com/products/code-respite" },
  STREAK_14: { id: "STREAK_14", title: "Blaze ☄️", desc: "Maintained a 14-day coding streak!", emoji: "☄️", message: "I just unlocked the 'Blaze' badge on CodeRespite for a 14-day streak! ☄️ https://destyastudio.com/products/code-respite" },
  STREAK_30: { id: "STREAK_30", title: "Inferno 🌋", desc: "Maintained a 30-day coding streak!", emoji: "🌋", message: "I just unlocked the 'Inferno' badge on CodeRespite for a 30-day streak! 🌋 https://destyastudio.com/products/code-respite" },
  STREAK_60: { id: "STREAK_60", title: "Phoenix 🦅", desc: "Maintained a 60-day coding streak!", emoji: "🦅", message: "I just unlocked the 'Phoenix' badge on CodeRespite for a 60-day streak! 🦅 https://destyastudio.com/products/code-respite" },
  STREAK_100: { id: "STREAK_100", title: "Sun God ☀️", desc: "Maintained a 100-day coding streak!", emoji: "☀️", message: "I just unlocked the 'Sun God' badge on CodeRespite for a 100-day streak! ☀️ https://destyastudio.com/products/code-respite" },

  // --- Quizzes ---
  QUIZ_1: { id: "QUIZ_1", title: "Quiz Curious 🧪", desc: "Completed your first quiz!", emoji: "🧪", message: "I just unlocked the 'Quiz Curious' badge on CodeRespite! 🧪 https://destyastudio.com/products/code-respite" },
  QUIZ_5: { id: "QUIZ_5", title: "Quiz Master 🧩", desc: "Completed 5 coding quizzes!", emoji: "🧩", message: "I just unlocked the 'Quiz Master' badge on CodeRespite! 🧩 https://destyastudio.com/products/code-respite" },
  QUIZ_10: { id: "QUIZ_10", title: "Quiz Addict 🎯", desc: "Completed 10 coding quizzes!", emoji: "🎯", message: "I just unlocked the 'Quiz Addict' badge on CodeRespite! 🎯 https://destyastudio.com/products/code-respite" },
  QUIZ_25: { id: "QUIZ_25", title: "Quiz Legend 🏆", desc: "Completed 25 coding quizzes!", emoji: "🏆", message: "I just unlocked the 'Quiz Legend' badge on CodeRespite! 🏆 https://destyastudio.com/products/code-respite" },
  QUIZ_50: { id: "QUIZ_50", title: "Quiz God 👑", desc: "Completed 50 coding quizzes!", emoji: "👑", message: "I just unlocked the 'Quiz God' badge on CodeRespite! 👑 https://destyastudio.com/products/code-respite" },

  // --- Perfect Quizzes (100% Score) ---
  PERFECT_1: { id: "PERFECT_1", title: "Perfectionist 💯", desc: "Scored 100% on a quiz!", emoji: "💯", message: "I just scored 100% on a quiz in CodeRespite! 💯 https://destyastudio.com/products/code-respite" },
  PERFECT_5: { id: "PERFECT_5", title: "Flawless ✨", desc: "Scored 100% on 5 quizzes!", emoji: "✨", message: "I just unlocked the 'Flawless' badge on CodeRespite! ✨ https://destyastudio.com/products/code-respite" },

  // --- Flashcards ---
  FLASHCARDS_10: { id: "FLASHCARDS_10", title: "Recall Novice 🧠", desc: "Reviewed 10 flashcards!", emoji: "🧠", message: "I just unlocked the 'Recall Novice' badge on CodeRespite! 🧠 https://destyastudio.com/products/code-respite" },
  FLASHCARDS_50: { id: "FLASHCARDS_50", title: "Memory Pro 💡", desc: "Reviewed 50 flashcards!", emoji: "💡", message: "I just unlocked the 'Memory Pro' badge on CodeRespite! 💡 https://destyastudio.com/products/code-respite" },
  FLASHCARDS_100: { id: "FLASHCARDS_100", title: "Recall Genius 💾", desc: "Reviewed 100 flashcards!", emoji: "💾", message: "I just unlocked the 'Recall Genius' badge on CodeRespite! 💾 https://destyastudio.com/products/code-respite" },
  FLASHCARDS_250: { id: "FLASHCARDS_250", title: "Elephant Memory 🐘", desc: "Reviewed 250 flashcards!", emoji: "🐘", message: "I just unlocked the 'Elephant Memory' badge on CodeRespite! 🐘 https://destyastudio.com/products/code-respite" },

  // --- Courses / Lessons ---
  COURSES_1: { id: "COURSES_1", title: "First Step 🚶", desc: "Started your first course!", emoji: "🚶", message: "I just started my first course on CodeRespite! 🚶 https://destyastudio.com/products/code-respite" },
  COURSES_3: { id: "COURSES_3", title: "Code Explorer 📚", desc: "Enrolled in 3 courses!", emoji: "📚", message: "I just unlocked the 'Code Explorer' badge on CodeRespite! 📚 https://destyastudio.com/products/code-respite" },
  COURSES_5: { id: "COURSES_5", title: "Scholar 🎓", desc: "Enrolled in 5 courses!", emoji: "🎓", message: "I just unlocked the 'Scholar' badge on CodeRespite! 🎓 https://destyastudio.com/products/code-respite" },

  // --- Levels ---
  LEVEL_2: { id: "LEVEL_2", title: "Level Up ⬆️", desc: "Reached Level 2!", emoji: "⬆️", message: "I just reached Level 2 on CodeRespite! ⬆️ https://destyastudio.com/products/code-respite" },
  LEVEL_5: { id: "LEVEL_5", title: "Rising Star 🌟", desc: "Reached Level 5!", emoji: "🌟", message: "I just reached Level 5 on CodeRespite! 🌟 https://destyastudio.com/products/code-respite" },
  LEVEL_10: { id: "LEVEL_10", title: "Pro Dev 💻", desc: "Reached Level 10!", emoji: "💻", message: "I just reached Level 10 on CodeRespite! 💻 https://destyastudio.com/products/code-respite" },
  LEVEL_15: { id: "LEVEL_15", title: "Code Wizard 🧙‍♂️", desc: "Reached Level 15!", emoji: "🧙‍♂️", message: "I just reached Level 15 on CodeRespite! 🧙‍♂️ https://destyastudio.com/products/code-respite" },
  LEVEL_20: { id: "LEVEL_20", title: "Tech Guru 🧘", desc: "Reached Level 20!", emoji: "🧘", message: "I just reached Level 20 on CodeRespite! 🧘 https://destyastudio.com/products/code-respite" },
};

/**
 * Checks for any newly unlocked badges based on user data stats.
 * Returns the first newly unlocked badge details, or null if none.
 */
export const checkNewBadges = async (userData) => {
  if (!userData) return null;

  const progressEntries = Object.entries(userData.progress || {});
  
  // Calculate counts
  const totalCourses = progressEntries.length;
  
  let totalQuizzes = 0;
  let perfectQuizzes = 0;
  let totalFlashcards = 0;

  progressEntries.forEach(([, data]) => {
    if (Array.isArray(data?.attemptedQuizzes)) {
      totalQuizzes += data.attemptedQuizzes.length;
      perfectQuizzes += data.attemptedQuizzes.filter(q => q.score === 100).length;
    }
    if (Array.isArray(data?.flashcardsViewed)) {
      totalFlashcards += data.flashcardsViewed.length;
    }
  });

  const currentStreak = userData?.streak?.currentStreak || 0;
  const currentLevel = userData?.level?.currentLevel || 1;

  // Check conditions
  const unlockedIds = [];
  
  // Streaks
  if (currentStreak >= 3) unlockedIds.push("STREAK_3");
  if (currentStreak >= 7) unlockedIds.push("STREAK_7");
  if (currentStreak >= 14) unlockedIds.push("STREAK_14");
  if (currentStreak >= 30) unlockedIds.push("STREAK_30");
  if (currentStreak >= 60) unlockedIds.push("STREAK_60");
  if (currentStreak >= 100) unlockedIds.push("STREAK_100");

  // Quizzes
  if (totalQuizzes >= 1) unlockedIds.push("QUIZ_1");
  if (totalQuizzes >= 5) unlockedIds.push("QUIZ_5");
  if (totalQuizzes >= 10) unlockedIds.push("QUIZ_10");
  if (totalQuizzes >= 25) unlockedIds.push("QUIZ_25");
  if (totalQuizzes >= 50) unlockedIds.push("QUIZ_50");

  // Perfect Quizzes
  if (perfectQuizzes >= 1) unlockedIds.push("PERFECT_1");
  if (perfectQuizzes >= 5) unlockedIds.push("PERFECT_5");

  // Flashcards
  if (totalFlashcards >= 10) unlockedIds.push("FLASHCARDS_10");
  if (totalFlashcards >= 50) unlockedIds.push("FLASHCARDS_50");
  if (totalFlashcards >= 100) unlockedIds.push("FLASHCARDS_100");
  if (totalFlashcards >= 250) unlockedIds.push("FLASHCARDS_250");

  // Courses
  if (totalCourses >= 1) unlockedIds.push("COURSES_1");
  if (totalCourses >= 3) unlockedIds.push("COURSES_3");
  if (totalCourses >= 5) unlockedIds.push("COURSES_5");

  // Levels
  if (currentLevel >= 2) unlockedIds.push("LEVEL_2");
  if (currentLevel >= 5) unlockedIds.push("LEVEL_5");
  if (currentLevel >= 10) unlockedIds.push("LEVEL_10");
  if (currentLevel >= 15) unlockedIds.push("LEVEL_15");
  if (currentLevel >= 20) unlockedIds.push("LEVEL_20");

  if (unlockedIds.length === 0) return null;

  try {
    const shownStr = await AsyncStorage.getItem("@shown_badges");
    const shownIds = shownStr ? JSON.parse(shownStr) : [];

    // Find the first unlocked ID that hasn't been shown yet
    const nextToShowId = unlockedIds.find((id) => !shownIds.includes(id));
    
    // Auto-save all currently unlocked badges to a separate key for the showcase page
    await AsyncStorage.setItem("@unlocked_badges", JSON.stringify(unlockedIds));

    if (!nextToShowId) return null;

    // Mark as shown
    const updatedShown = [...shownIds, nextToShowId];
    await AsyncStorage.setItem("@shown_badges", JSON.stringify(updatedShown));

    return BADGES[nextToShowId];
  } catch (err) {
    console.error("Error checking badges:", err);
    return null;
  }
};

export const getUnlockedBadges = async () => {
  try {
    const unlockedStr = await AsyncStorage.getItem("@unlocked_badges");
    return unlockedStr ? JSON.parse(unlockedStr) : [];
  } catch (err) {
    console.error("Error getting unlocked badges:", err);
    return [];
  }
};
