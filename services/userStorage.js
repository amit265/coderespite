import AsyncStorage from "./storage";

const STORAGE_KEY = "@user_data";

// Default structure
const defaultUserData = {
  profile: {
    name: "user",
    avatar: "avatar2.png",
    firstTime: true,
    enrolledPath: null,
    isPro: false,
    aiChatsUsedToday: 0,
    lastChatDate: null,
  },
  preferences: {
    darkMode: false,
    sound: true,
  },
  level: {
    currentLevel: 1,
    xp: 0,
    nextLevelXP: 100,
  },
  progress: {
    // courses will be added dynamically: html, css, js, etc.
  },
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    freezes: 1, // Start with 1 free freeze
    lastStudyDate: null,
  },
};

// Get entire user data
export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    // console.log("data from getUserdate", data);

    return data ? JSON.parse(data) : defaultUserData;
  } catch (error) {
    console.error("Error getting user data:", error);
    return defaultUserData;
  }
};

// Set entire user data
export const setUserData = async (data) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error setting user data:", error);
  }
};

// Update a specific key inside user data (deep merge)
export const updateUserData = async (updateFn) => {
  const current = await getUserData();
  const updated = updateFn({ ...current });
  await setUserData(updated);
};

// Add XP and handle level up
export const gainXP = async (earnedXP) => {
  await updateUserData((data) => {
    data.level.xp += earnedXP;

    while (data.level.xp >= data.level.nextLevelXP) {
      data.level.xp -= data.level.nextLevelXP;
      data.level.currentLevel += 1;
      data.level.nextLevelXP += 100; // increase difficulty
    }

    return data;
  });
  
  // Earning XP counts as studying, update the streak
  await updateStreak();
};

// Update progress in a course
export const updateCourseProgress = async (course, updates) => {
  await updateUserData((data) => {
    if (!data.progress[course]) {
      data.progress[course] = {
        quizzesAttempted: [],
        flashcardsLoved: [],
        completed: false,
        percentage: 0,
        flashcardsViewed: [], // initialize here if no course progress
      };
    }

    data.progress[course] = {
      ...data.progress[course],
      ...updates,
    };
    return data;
  });
};

// Set first time to false
export const markNotFirstTime = async () => {
  await updateUserData((data) => {
    data.profile.firstTime = false;
    return data;
  });
};

export const setEnrolledPath = async (pathId) => {
  await updateUserData((data) => {
    data.profile.enrolledPath = pathId;
    return data;
  });
};

export const incrementAIChatCount = async () => {
  await updateUserData((data) => {
    const today = new Date().toISOString().split("T")[0];
    if (data.profile.lastChatDate !== today) {
      data.profile.aiChatsUsedToday = 1;
      data.profile.lastChatDate = today;
    } else {
      data.profile.aiChatsUsedToday = (data.profile.aiChatsUsedToday || 0) + 1;
    }
    return data;
  });
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    console.log("All data cleared from AsyncStorage.");
  } catch (e) {
    console.error("Failed to clear AsyncStorage:", e);
  }
};

// Streak System Methods
export const updateStreak = async () => {
  await updateUserData((data) => {
    if (!data.streak) {
      data.streak = { currentStreak: 0, longestStreak: 0, freezes: 1, lastStudyDate: null };
    }
    
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    if (data.streak.lastStudyDate === today) {
      return data; // Already studied today
    }
    
    if (!data.streak.lastStudyDate) {
      // First time studying
      data.streak.currentStreak = 1;
      data.streak.longestStreak = 1;
    } else {
      const lastDate = new Date(data.streak.lastStudyDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Studied yesterday
        data.streak.currentStreak += 1;
      } else if (diffDays > 1) {
        // Missed one or more days
        const missedDays = diffDays - 1;
        if (data.streak.freezes >= missedDays) {
          // Used freezes
          data.streak.freezes -= missedDays;
          data.streak.currentStreak += 1;
        } else {
          // Streak broken
          data.streak.currentStreak = 1;
        }
      }
      
      if (data.streak.currentStreak > data.streak.longestStreak) {
        data.streak.longestStreak = data.streak.currentStreak;
      }
    }
    
    // Reward a streak freeze for every 7 day streak
    if (data.streak.currentStreak > 0 && data.streak.currentStreak % 7 === 0) {
      data.streak.freezes += 1;
    }
    
    data.streak.lastStudyDate = today;
    return data;
  });
  
  // Schedule a reminder for tomorrow since the user studied today
  const { scheduleStreakReminder } = require('./notificationService');
  await scheduleStreakReminder();
};

export const addStreakFreeze = async (amount = 1) => {
  await updateUserData((data) => {
    if (!data.streak) {
      data.streak = { currentStreak: 0, longestStreak: 0, freezes: 1, lastStudyDate: null };
    }
    data.streak.freezes += amount;
    return data;
  });
};

export const logAllAsyncStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);

    console.log("📦 AsyncStorage Contents:");
    items.forEach(([key, value]) => {
      // console.log(`🗝️ ${key}:`, JSON.parse(value));
    });
  } catch (e) {
    console.error("Failed to log AsyncStorage:", e);
  }
};
