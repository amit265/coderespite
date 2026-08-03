import * as Notifications from "expo-notifications";

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const initNotifications = async () => {
  try {
    // 1. Request/check permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== "granted") {
      console.log("[Notifications] Permission not granted!");
      return false;
    }

    // 2. Clear old to prevent stacking
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 3. Schedule daily prompt
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Ready for your daily challenge? 🐾",
        body: "Refresh your coding skills and build your meow-streak!",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 19, // 7:00 PM
        minute: 0,
      },
    });
    console.log("[Notifications] Daily challenge prompt scheduled successfully at 7:00 PM");
    return true;
  } catch (error) {
    console.error("[Notifications] Initialization error:", error);
    return false;
  }
};
