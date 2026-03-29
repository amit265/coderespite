# 🚀 CodeRespite Future Roadmap & TODOs

This file tracks technical debt, security enhancements, and feature requests for future development cycles.

---

## 🔒 Security & Backend
- [ ] **Implement Firebase App Check**
  - **iOS:** Register for App Attest / DeviceCheck.
  - **Android:** Enable Play Integrity API.
  - **Why:** Prevents unauthorized access to Firestore by verifying the app's integrity on real devices.
- [ ] **Firestore Security Rules**
  - Review and tighten rules in the Firebase console to ensure users can only write to their own data (if we move from local-only to cloud-sync).

---

## 🔔 Engagement & Features
- [ ] **Push Notifications Integration**
  - Integrate `expo-notifications`.
  - Set up Apple Push Notification service (APNs) and Firebase Cloud Messaging (FCM).
  - **Features:** Daily study reminders, streak alerts, and new course announcements.
- [ ] **Streak System Enhancements**
  - Add "Streak Freeze" items or rewards for consistent daily logins.
- [ ] **Social Sharing**
  - Add a "Share My Progress" feature to allow users to post their quiz results or level-ups to social media.

---

## 🛠️ Performance & Infrastructure
- [ ] **Image Optimization**
  - Audit the `/assets/images` folder. Convert large PNGs to WebP where possible to reduce bundle size.
- [ ] **Offline Mode (Advanced)**
  - Cache Firestore course data locally using `expo-file-system` to allow learning without an internet connection.
- [ ] **CI/CD Automation**
  - Set up GitHub Actions to automatically run `eas build` on specific branch merges.

---

## 🍎 iOS Submission Polish
- [ ] **Apple Sign-In (Optional)**
  - If we ever move from `AsyncStorage` to a Cloud-based Login system, Apple Sign-In must be implemented to satisfy App Store guidelines.
- [ ] **Review Ad Frequency**
  - Monitor user feedback on App Open Ads. If users find them too intrusive, increase the `appOpenAdFrequency` in `adSettings` via Firebase Remote Config.

---

## 🧹 Maintenance
- [ ] **Cleanup Redundant Packages**
  - Check if `react-native-image-picker` is still needed since `expo-image-picker` is also installed.
- [ ] **Unit Testing**
  - Add Jest tests for utility functions in `services/` (e.g., `generateLastNDaysData.js`).
