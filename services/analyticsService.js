import analytics from '@react-native-firebase/analytics';

export const logAnalyticsEvent = async (eventName, params = {}) => {
  try {
    console.log(`[Analytics] Logging event: ${eventName}`, params);
    
    // Check if Firebase Analytics is loaded in the current runtime environment
    if (typeof analytics === 'function') {
      const analyticsInstance = analytics();
      if (analyticsInstance && typeof analyticsInstance.logEvent === 'function') {
        await analyticsInstance.logEvent(eventName, params);
        return;
      }
    }
    
    console.log(`[Analytics] Native Firebase Analytics not available in this build. Event simulated: ${eventName}`);
  } catch (error) {
    console.error("[Analytics] Error logging native event:", error);
  }
};
