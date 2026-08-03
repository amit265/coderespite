import AsyncStorage from "@react-native-async-storage/async-storage";

export const BADGES = {
  COURSES_3: {
    id: "COURSES_3",
    title: "Code Explorer 📚",
    desc: "Enrolled in 3 programming courses!",
    emoji: "📚",
    message: "I just unlocked the 'Code Explorer' badge on CodeRespite! 📚 Learning programming one bite at a time. Join me and download the app: https://destyastudio.com/products/code-respite",
  },
  QUIZZES_5: {
    id: "QUIZZES_5",
    title: "Quiz Master 🧪",
    desc: "Completed 5 coding quizzes!",
    emoji: "🧪",
    message: "I just unlocked the 'Quiz Master' badge on CodeRespite! 🧪 Test your own programming skills with interactive challenges: https://destyastudio.com/products/code-respite",
  },
  FLASHCARDS_10: {
    id: "FLASHCARDS_10",
    title: "Recall Genius 🧠",
    desc: "Reviewed 10 flashcards in study sessions!",
    emoji: "🧠",
    message: "I just unlocked the 'Recall Genius' badge on CodeRespite! 🧠 Master key developer concepts with spaced-repetition active recall: https://destyastudio.com/products/code-respite",
  },
};

/**
 * Checks for any newly unlocked badges based on user data stats.
 * Returns the first newly unlocked badge details, or null if none.
 */
export const checkNewBadges = async (userData) => {
  if (!userData || !userData.progress) return null;

  const progressEntries = Object.entries(userData.progress);
  
  // Calculate counts
  const totalCourses = progressEntries.length;
  
  const totalQuizzes = progressEntries.reduce((total, [, data]) => {
    return total + (Array.isArray(data?.attemptedQuizzes) ? data.attemptedQuizzes.length : 0);
  }, 0);

  const totalFlashcards = progressEntries.reduce((total, [, data]) => {
    return total + (Array.isArray(data?.flashcardsViewed) ? data.flashcardsViewed.length : 0);
  }, 0);

  // Check conditions
  const unlockedIds = [];
  if (totalCourses >= 3) unlockedIds.push("COURSES_3");
  if (totalQuizzes >= 5) unlockedIds.push("QUIZZES_5");
  if (totalFlashcards >= 10) unlockedIds.push("FLASHCARDS_10");

  if (unlockedIds.length === 0) return null;

  try {
    const shownStr = await AsyncStorage.getItem("@shown_badges");
    const shownIds = shownStr ? JSON.parse(shownStr) : [];

    // Find the first unlocked ID that hasn't been shown yet
    const nextToShowId = unlockedIds.find((id) => !shownIds.includes(id));
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
