module.exports = {
  expo: {
    name: "CodeRespite: Refresh skills",
    slug: "coderespite",
    version: "1.1.3",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "coderespite",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.destyastudio.coderespite",
      icon: "./assets/iosIcon.png",
      infoPlist: {
        NSUserTrackingUsageDescription:
          "This identifier will be used to deliver personalized ads to you.",
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#CBE7F7",
      },
      edgeToEdgeEnabled: true,
      package: "com.mindcraftlearning.coderespite",
      versionCode: 12,
      permissions: ["com.google.android.gms.permission.AD_ID"],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
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
          androidAppId: "ca-app-pub-7433519007687449~1317833947",
          iosAppId: "ca-app-pub-7433519007687449~2791886380",
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
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            minSdkVersion: 24,
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            enableHermes: true,
          },
        },
      ],
      "expo-web-browser",
      "expo-tracking-transparency",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      admob: {
        androidAppId: "ca-app-pub-7433519007687449~1317833947",
        iosAppId: "ca-app-pub-7433519007687449~2791886380",
      },
      eas: {
        projectId: "45e5a71a-6a35-4ad2-9a84-243ad0a992a9",
      },
    },
    owner: "mindcraftlearning",
  },
};
