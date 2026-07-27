# Desty Studio Apps: Common Architecture & Guidelines

This document outlines the standard configurations, design paradigms, and cross-platform behaviors implemented across Desty Studio's suite of 5 mobile applications:

1. **Spin the Wheel : Pick for me** (Entertainment)
2. **CodeRespite: Refresh Your Tech Skills** (Productivity)
3. **AI Icebreaker: Question Games** (Social / Lifestyle)
4. **Cheesy Lines: So Bad, It Works** (Entertainment)
5. **Trivia Quest AI: Fun Quiz Game** (Education)

link

https://destyastudio.com/products/spin-the-wheel
https://destyastudio.com/products/code-respite
https://destyastudio.com/products/question-games
https://destyastudio.com/products/cheezylines
https://destyastudio.com/products/trivia-quest-ai

logo

https://destyastudio.com/_next/image?url=%2Fapps%2Fspin-the-wheel%2Ficon.png&w=1920&q=75
https://destyastudio.com/_next/image?url=%2Fapps%2Fcode-respite%2Ficon.png&w=1920&q=75
https://destyastudio.com/_next/image?url=%2Fapps%2Fquestion-games%2Ficon.png&w=1920&q=75
https://destyastudio.com/_next/image?url=%2Fapps%2Fcheezylines%2Ficon.png&w=1920&q=75
https://destyastudio.com/_next/image?url=%2Fapps%2Ftrivia-quest-ai%2Ficon.png&w=1920&q=75

Use this as a reference guide when developing, updating, or unifying any Desty Studio codebases.

---

## 1. Brand Identity & Design Tokens

To ensure immediately recognizable studio branding, all apps use a consistent structural design system.

### A. Theme Colors

- **Brand Colors:** Deep Indigo (`#132F94`), Dark Slate (`#0C1D59`), and Accent/CTA Neon Amber (`#FFA500`).
- **Application UI:** Keep tab bars, popup headers, settings menus, and modals consistent across all apps using these brand colors. Content elements (e.g. wheels, quiz cards, cheesy lines lists) can use app-specific color themes.

### B. Logo Intro Stamp

- **Startup/Landing Branding:** At the bottom of welcome pages, startup splash screens (`SplashScreens.jsx`), or sign-in layouts, display:
  `● built by destyastudio.`
  Use a small, clean, monospaced font style to maintain a premium feel. Position it absolutely at the bottom of the splash page:
  ```jsx
  brandingText: {
    position: "absolute",
    bottom: 50,
    fontFamily: "monospace",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.4)",
    letterSpacing: 1.5,
  }
  ```

---

## 2. Web Environment Constraints & Gatekeeping

To drive native mobile app installs, Web builds are constrained as interactive promotional previews.

### A. Centered Portrait Layout (App Simulator)

- **Behavior:** On desktop monitors, the app must not stretch landscape to fill the screen. It must render inside a centered, phone-sized portrait container. On mobile browsers, it expands to normal full-screen portrait.
- **Implementation (`app/_layout.tsx`):**
  ```jsx
  {
    Platform.OS === "web" ? (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0C1D59",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 480,
            height: "95%",
            maxHeight: 850,
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: "#132F94",
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaView>
        </View>
      </View>
    ) : (
      <SafeAreaView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    );
  }
  ```

### B. Web Tab Interception & Download Prompts

- **Behavior:** Users on the Web version can explore the **Home** tab freely. Clicking on other tabs (e.g. _Quiz_, _Explore_, _Profile_) blocks the navigation transition and shows a beautiful modal prompting them to download the mobile app.
- **Implementation (`app/(tabs)/_layout.jsx`):**
  ```javascript
  const webTabListener = {
    tabPress: (e) => {
      if (Platform.OS === "web") {
        e.preventDefault(); // Stop tab switch
        setIsDownloadModalVisible(true); // Open the Modal
      }
    },
  };
  ```

### C. Web Layout & Dimension Calculations (Avoiding SSR Width Crashes)

- **Constraint:** Never use `Dimensions.get("window")` or `Dimensions.get("screen")` globally at the module import level. During Web bundle/SSR generation, this evaluates to `0`, leading to negative card widths or broken grids.
- **Solution:** Compute dimensions dynamically inside the component body using the `useWindowDimensions` hook:

  ```javascript
  import { useWindowDimensions } from "react-native";

  export default function MyGridComponent() {
    const { width } = useWindowDimensions();
    const screenWidth = Math.min(width || 480, 480);
    const cardWidth = (screenWidth - padding) / columns;
    // ...
  }
  ```

---

## 3. Platform-Specific Dependency Isolation

Metro statically analyzes all imports. Native-only dependencies must be completely isolated from the Web target.

### A. Ad & Consent Manager Isolation

Use Metro's platform-specific suffix resolution to separate Web code from Native code:

- **`AdManager.js` (Native Android/iOS):** Imports `react-native-google-mobile-ads` to display Banner, Interstitial, and Rewarded ads.
- **`AdManager.web.js` (Web Preview):** A mock component exporting the same layout interfaces and hooks, returning `null` or mocked success promises.
- **`adInit.js` / `adInit.web.js`:** Separate files containing platform-isolated initialization procedures to avoid static `require()` errors on Web builds.

---

## 4. Brand Cross-Promotion & Synergy

To maximize organic traction, all apps feature standard cross-promotion hooks.

### A. The "More from Destya Studio" Hub

- **Behavior:** Add a dedicated visual card list inside the Settings or Profile screen displaying the other 4 Desty Studio apps.
- **Robust Fallback:** Hardcode the list of the other 4 apps in the component state as a local default. This guarantees the cross-promotion cards are visible even if the device is offline or the Firebase Config database fails:

  ```javascript
  const FALLBACK_APPS = [
    {
      name: "Spin the Wheel : Pick for me",
      description:
        "Spin the wheel to decide fun topics, games, meals, or challenges!",
      icon: "https://destyastudio.com/apps/spin-the-wheel/icon.png",
      androidUrl: "https://destyastudio.com/products/spin-the-wheel",
      iosUrl: "https://destyastudio.com/products/spin-the-wheel",
      isAvailableOnIOS: true,
    },
    // ... other 3 apps
  ];

  const [moreApps, setMoreApps] = useState(FALLBACK_APPS);
  ```

### B. Redirection URL Queries

- **Redirection page:** The landing page redirection script handles redirect paths based on parameters (e.g. `?app=spin-the-wheel` or `?app=cheezylines`) to direct the user to the correct app store link automatically.

### C. Gamified Cross-Promotion Rewards

- **Behavior:** Reward users in App A for trying out App B.
- **Example:** Give 2 free AI Quiz generations or +50 XP when they tap to open "Cheesy Lines" or "Spin the Wheel".
- **Tracking:** Save a local key `ds_cross_promo_[target_app_slug]_clicked` in `AsyncStorage` when redirecting, and reward them immediately upon detection.

---

## 5. Local & Push Notifications

All apps implement remote push channels for campaigns, and daily local notifications to boost user retention.

- **Libraries:** `expo-notifications`
- **Daily Engagement Prompts (Local):** Schedule recurring reminders locally so they trigger offline. Ensure these are cleared and reset upon app launch to prevent notification stacking:
  ```javascript
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Ready for your daily challenge?",
      body: "Unlock new AI topics and test your knowledge now!",
    },
    trigger: {
      hour: 19, // 7:00 PM
      minute: 0,
      repeats: true,
    },
  });
  ```

---

## 6. Event Analytics

To measure user retention, campaign conversions, and milestone actions, integrate custom event tracking.

- **Native Engine:** `@react-native-firebase/analytics` (Native dependency match required, e.g. matching major version numbers of `@react-native-firebase/app` using `--legacy-peer-deps`).
- **Web Engine Fallback:** Log event parameters to browser console or Google Analytics gtag.
- **Standard Events to Track:**
  - `quiz_completed` / `wheel_spun` / `line_saved`
  - `score_shared` / `invite_sent`
  - `in_app_purchase_clicked`

---

## 7. Android Target API Compliance (Android 16 / API 36+)

To ensure that Desty Studio apps remain updateable and compliant on Google Play:

- **Requirement:** Apps must target Android 16 (API level 36) or higher.
- **Constraint:** From August 31, 2026, updates will be disabled if the target API level is not within 1 year of the latest Android release.
- **Implementation:** Configure the SDK build properties in `app.json` under plugins:
  ```json
  {
    "expo": {
      "plugins": [
        [
          "expo-build-properties",
          {
            "android": {
              "targetSdkVersion": 36
            }
          }
        ]
      ]
    }
  }
  ```
- **Action Required:** Bump target SDK, verify compiling, and release a new version to production.

---

## 8. App Store Optimization (ASO) & Store Presence

To maximize organic discoverability and increase App Store and Google Play conversions across all Desty Studio apps, adhere to the following metadata and store presence rules:

### A. Metadata Constraints & Search Terms
- **App Title:** Keep titles short and impact-driven (≤ 30 characters on both platforms) containing the brand name and one primary search term (e.g. `CodeRespite: Refresh skills` or `Trivia Quest AI: Fun Quiz`).
- **Short Description / Subtitle:** Limit to ≤ 30 characters on iOS App Store and ≤ 80 characters on Google Play Store. Highlight the unique selling proposition (USP).
- **Keyword Density:** Maintain a natural 2% to 3% keyword density in the App Store full description. Avoid keyword stuffing.

### B. Promotional Landing Pages (Web Previews)
- **Visuals:** On wide desktop screens, configure a side promotion panel adjacent to the portrait Web Simulator.
- **Content:** The panel must feature:
  - Clear app title and descriptive text detailing core features.
  - Bulleted key benefits.
  - App Store and Google Play redirection buttons (using standard links) to guide desktop visitors to mobile installations.
- **Example Layout (`app/_layout.tsx`):** Use a `flexDirection: "row"` container on Web builds that wraps to `column` on small viewport screens to present side-by-side promotional badges and mockups.

