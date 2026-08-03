import { useEffect } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

export const useDeepLinkHandler = () => {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = (url) => {
      if (!url) return;
      
      console.log("[DeepLink] Handling deep link:", url);
      const parsed = Linking.parse(url);
      const { path, queryParams } = parsed;
      
      // Handle navigation tab selection based on parameters
      const targetTab = queryParams?.tab || queryParams?.screen;
      
      if (targetTab) {
        console.log(`[DeepLink] Routing to tab: ${targetTab}`);
        if (targetTab === "quiz") {
          router.push("/(tabs)/quiz");
        } else if (targetTab === "learn") {
          router.push("/(tabs)/learn");
        } else if (targetTab === "flashcards") {
          router.push("/(tabs)/flashcards");
        } else if (targetTab === "profile") {
          router.push("/(tabs)/profile");
        } else if (targetTab === "settings") {
          router.push("/settings");
        }
      }
    };

    // 1. Handle cold start deep links
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    }).catch(err => console.error("[DeepLink] Failed to get initial URL:", err));

    // 2. Handle foreground deep links
    const subscription = Linking.addEventListener("url", (event) => {
      if (event.url) handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);
};
