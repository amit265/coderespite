const packageJson = require("./package.json");

module.exports = {
  expo: {
    name: "CodeRespite",
    description:
      "Master programming languages, prepare for technical interviews, and build developer habits with CodeRespite—your pocket-sized AI coding companion! 🐾",
    slug: "coderespite",
    version: packageJson.version,
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "coderespite",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    updates: {
      url: "https://u.expo.dev/45e5a71a-6a35-4ad2-9a84-243ad0a992a9"
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.destyastudio.coderespite",
      icon: "./assets/iosIcon.png",
      buildNumber: "4",
      infoPlist: {
        NSUserTrackingUsageDescription:
          "This identifier will be used to deliver personalized ads to you.",
        ITSAppUsesNonExemptEncryption: false,
      },
      googleServicesFile: "./GoogleService-Info.plist",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#CBE7F7",
      },
      edgeToEdgeEnabled: true,
      package: "com.mindcraftlearning.coderespite",
      versionCode: 28,
      googleServicesFile: "./google-services.json",
      permissions: ["com.google.android.gms.permission.AD_ID"],
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "destyastudio.com",
              pathPrefix: "/code-respite",
            },
            {
              scheme: "https",
              host: "destyastudio.com",
              pathPrefix: "/products/code-respite",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      softwareKeyboardLayoutMode: "resize",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-secure-store",
      "expo-router",
      "@react-native-firebase/app",
      "@react-native-firebase/analytics",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#CBE7F7",
          image: "./assets/images/splashScreen.png",
          resizeMode: "contain",
          width: 200,
        },
      ],
      "expo-font",
      [
        "react-native-google-mobile-ads",
        {
          androidAppId:
            process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ||
            "ca-app-pub-7433519007687449~1317833947",
          iosAppId:
            process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ||
            "ca-app-pub-7433519007687449~2791886380",
          userTrackingUsageDescription:
            "This identifier will be used to deliver personalized ads to you.",
          skAdNetworkItems: [
            "cstr6suwn9.skadnetwork",
            "4fzdc2evr5.skadnetwork",
            "4pfyvq9l8r.skadnetwork",
            "2fnua5tdw4.skadnetwork",
            "ydx93a7ass.skadnetwork",
            "5a6flpkh64.skadnetwork",
            "p78axxw29g.skadnetwork",
            "v72qych5uu.skadnetwork",
            "ludvb6z3bs.skadnetwork",
            "cp8zw746q7.skadnetwork",
            "3sh42y64q3.skadnetwork",
            "c6k4g5qg8m.skadnetwork",
            "s39g8k73mm.skadnetwork",
            "3qy4746246.skadnetwork",
            "3rd42ekr43.skadnetwork",
            "3qcr597p9d.skadnetwork",
          ],
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            minSdkVersion: 24,
            enableProguardInReleaseBuilds: false,
            enableShrinkResourcesInReleaseBuilds: false,
            enableHermes: true,
            extraProguardRules: "-keep class expo.modules.** { *; }",
          },
        },
      ],
      "expo-web-browser",
      "expo-tracking-transparency",
      [
        "@sentry/react-native/expo",
        {
          organization: process.env.EXPO_PUBLIC_SENTRY_ORG || "destya-studio",
          project: process.env.EXPO_PUBLIC_SENTRY_PROJECT || "coderespite",
        },
      ]
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      admob: {
        androidAppId:
          process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ||
          "ca-app-pub-7433519007687449~1317833947",
        iosAppId:
          process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ||
          "ca-app-pub-7433519007687449~2791886380",
      },
      eas: {
        projectId: "45e5a71a-6a35-4ad2-9a84-243ad0a992a9",
      },
    },
    owner: "mindcraftlearning",
  },
};
