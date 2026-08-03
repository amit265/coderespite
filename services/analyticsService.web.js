// Web Mock Analytics helper
export const logAnalyticsEvent = async (eventName, params = {}) => {
  console.log(`[Analytics.web] Logged event: "${eventName}"`, params);
  return Promise.resolve();
};
