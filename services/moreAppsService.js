import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Platform } from "react-native";

export const getMoreApps = async () => {
  try {
    const moreAppsRef = doc(db, "config", "moreApps");
    const docSnap = await getDoc(moreAppsRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const apps = data.apps || [];
      
      // Filter apps based on platform and show flag
      return apps.filter(app => {
        if (!app.show) return false;
        
        if (Platform.OS === 'ios') {
          return app.isAvailableOnIOS && app.iosUrl;
        } else if (Platform.OS === 'android') {
          return app.androidUrl;
        }
        
        return true;
      });
    } else {
      console.log("No moreApps config found!");
      return [];
    }
  } catch (error) {
    console.error("Error fetching more apps:", error);
    return [];
  }
};
