import * as Notifications from "expo-notifications";
import AsyncStorage from "./storage";

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // Request FCM Permission if possible
  try {
    const messaging = require('@react-native-firebase/messaging').default;
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
    if (enabled) {
      console.log('FCM Authorization status:', authStatus);
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
    }
  } catch (err) {
    console.log("FCM Setup error (expected in Expo Go): ", err);
  }
  
  if (finalStatus !== "granted") {
    console.log("[Notifications] Permission not granted!");
    return false;
  }
  return true;
};

// Schedules the daily reminder (e.g. 7 PM)
export const scheduleDailyReminder = async (hour = 19, minute = 0) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  // We tag this notification so we can manage it separately if needed,
  // but expo-notifications standard scheduling is ID-based.
  // Easiest approach is to just clear and re-schedule.
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to code! 🐾",
      body: "Refresh your coding skills and build your meow-streak!",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  console.log(`[Notifications] Daily reminder scheduled at ${hour}:${minute}`);
};

// Call this every time the user completes a study session (updateStreak)
export const scheduleStreakReminder = async () => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  // Cancel any existing streak danger notifications to reset the timer
  await cancelStreakReminder();

  // Schedule for tomorrow at 9 PM
  const triggerDate = new Date();
  triggerDate.setDate(triggerDate.getDate() + 1); // Tomorrow
  triggerDate.setHours(21); // 9 PM
  triggerDate.setMinutes(0);
  triggerDate.setSeconds(0);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "⚠️ Streak in Danger!",
      body: "Your coding streak is about to break! Jump in for 5 minutes to save it. 🔥",
      sound: true,
    },
    trigger: { type: 'date', date: triggerDate },
  });

  // Save the ID so we can cancel it later
  await AsyncStorage.setItem("@streak_notification_id", id);
  console.log("[Notifications] Streak danger scheduled for tomorrow at 9 PM");
};

export const cancelStreakReminder = async () => {
  try {
    const id = await AsyncStorage.getItem("@streak_notification_id");
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem("@streak_notification_id");
    }
  } catch (error) {
    console.log("[Notifications] Error canceling streak reminder", error);
  }
};

export const initNotifications = async () => {
  try {
    await requestNotificationPermissions();
    // Clear old generic ones to prevent stacking
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Set up default schedules
    await scheduleDailyReminder(19, 0); // Default 7 PM daily reminder
    await scheduleStreakReminder(); // Initial streak reminder setup
    
    return true;
  } catch (error) {
    console.error("[Notifications] Initialization error:", error);
    return false;
  }
};
