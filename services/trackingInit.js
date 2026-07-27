import * as TrackingTransparency from 'expo-tracking-transparency';

export const requestTrackingPermission = async () => {
  console.log("[Tracking] Requesting iOS tracking permission");
  await TrackingTransparency.getTrackingPermissionsAsync();
  await TrackingTransparency.requestTrackingPermissionsAsync();
};
