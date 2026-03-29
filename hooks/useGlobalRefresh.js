import { useContext, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { allCoursesContext, userDetailsContext } from "../context/context";
import { getAllCoursesWithSubcollections } from "../services/getAllCoursesWithSubcollections";

export const useGlobalRefresh = () => {
  const [globalRefreshing, setGlobalRefreshing] = useState(false);
  const allCourses = useContext(allCoursesContext);
  const userDetails = useContext(userDetailsContext);

  const setAllCourses = allCourses?.setAllCourses;
  const updateUser = userDetails?.updateUser;

  /**
   * Refreshes data.
   * @param {boolean} shouldFetchRemote - If true, fetches from API after loading cache. If false, stops after loading cache.
   */
  const refreshData = useCallback(async (shouldFetchRemote = true) => {
    if (!setAllCourses || !updateUser) {
      console.warn("Refresh data called before context was available.");
      return;
    }
    
    setGlobalRefreshing(true);
    try {
      console.log("🔄 Global Refresh Triggered...");

      // --- STEP 1: Always Load User from Local Storage ---
      const storedUser = await AsyncStorage.getItem("@user_data");
      if (storedUser) {
        updateUser(JSON.parse(storedUser));
      }

      // --- STEP 2: Check Course Cache ---
      const storedCourses = await AsyncStorage.getItem("@allCourses_data");
      let hasCache = false;

      if (storedCourses) {
        console.log("📦 Cache found. Updating UI immediately.");
        setAllCourses(JSON.parse(storedCourses));
        hasCache = true;
      }

      // --- STEP 3: Fetch from Firebase (Conditional) ---
      // We fetch if:
      // 1. shouldFetchRemote is true (Pull-to-refresh or explicit update)
      // 2. OR if we found NO data in the cache (First install)
      if (shouldFetchRemote || !hasCache) {
        console.log("🌍 Fetching fresh data from Firebase...");

        try {
          const freshData = await getAllCoursesWithSubcollections();

          setAllCourses(freshData);
          await AsyncStorage.setItem("@allCourses_data", JSON.stringify(freshData));
          console.log("✅ Remote Fetch Complete");
        } catch (error) {
          console.error("❌ Remote fetch failed:", error);

          if (!hasCache) {
            throw error;
          }

          console.log("📦 Keeping cached course data after remote fetch failure.");
        }
      } else {
        console.log("⏭️ Skipping remote fetch (Using Cache Only)");
      }

    } catch (error) {
      console.error("❌ Refresh failed:", error);
    } finally {
      setGlobalRefreshing(false);
    }
  }, [setAllCourses, updateUser]);

  return { refreshData, globalRefreshing };
};
