import { useState, useEffect, useContext } from "react"; // Import useRef
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { adConfigContext } from "../context/context";
import { useGlobalRefresh } from "./useGlobalRefresh";

export const useAppInitialization = () => {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const { refreshData, refreshing } = useGlobalRefresh();
  const { setAdConfig } = useContext(adConfigContext);

  // 1. Initialization Logic
  useEffect(() => {
    // Ref to track if the component is mounted
    let isMounted = true; 
    let unsubscribeAdConfig = null;

    const initialize = async () => {
      // A. Start Ad Config Listener
      try {
        unsubscribeAdConfig = onSnapshot(
          doc(db, "config", "adSettings"),
          (docSnapshot) => {
            // Only update state if mounted
            if (isMounted && docSnapshot.exists()) {
              setAdConfig(docSnapshot.data());
            }
          },
          (error) => console.log("Ad Config Error:", error)
        );
      } catch (error) {
        console.log("Snapshot setup error", error);
      }

      try {
        // B. Load Global Data
        await refreshData();
        
        // C. Check Navigation
        const storedUser = await AsyncStorage.getItem("@user_data");
        if (storedUser && isMounted) {
          const user = JSON.parse(storedUser);
          if (user?.profile?.name && user.profile.name !== "user") {
             setTimeout(() => {
               if(isMounted) router.replace("(tabs)");
             }, 100);
          }
        }
      } catch (e) {
        console.warn("Init Error:", e);
      } finally {
        if (isMounted) {
          setIsReady(true);
          await SplashScreen.hideAsync();
        }
      }
    };

    initialize();

    // CLEANUP FUNCTION
    return () => {
      isMounted = false; // Mark as unmounted
      if (unsubscribeAdConfig) {
        unsubscribeAdConfig(); // Unsubscribe safely
      }
    };
  }, []); 

  // 2. Custom Splash Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCustomSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return {
    isReady,
    showCustomSplash,
    refreshing,
    refreshData,
  };
};