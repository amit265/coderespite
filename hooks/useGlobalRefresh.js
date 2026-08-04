import { useContext, useState, useCallback } from "react";
import AsyncStorage from "../services/storage";
import { allCoursesContext, userDetailsContext } from "../context/context";
import { getAllCoursesWithSubcollections } from "../services/getAllCoursesWithSubcollections";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useGlobalRefresh = () => {
  const [globalRefreshing, setGlobalRefreshing] = useState(false);
  const allCourses = useContext(allCoursesContext);
  const userDetails = useContext(userDetailsContext);
  const queryClient = useQueryClient();

  const setAllCourses = allCourses?.setAllCourses;
  const updateUser = userDetails?.updateUser;

  const fetchMergedCourses = async () => {
    console.log("🌍 Fetching fresh data from Firebase...");
    const freshData = await getAllCoursesWithSubcollections();
    
    const storedCustom = await AsyncStorage.getItem("@custom_ai_courses");
    let customCourses = storedCustom ? JSON.parse(storedCustom) : [];
    
    let needsSave = false;
    customCourses = customCourses.map(c => {
      if (!c.id?.toString().startsWith("AI_ROADMAP_")) {
        needsSave = true;
        return { ...c, id: `AI_ROADMAP_${c.id || Date.now()}` };
      }
      return c;
    });
    
    if (needsSave) {
      await AsyncStorage.setItem("@custom_ai_courses", JSON.stringify(customCourses));
    }
    
    return [...(freshData || []), ...customCourses];
  };

  const { refetch } = useQuery({
    queryKey: ["allCourses"],
    queryFn: fetchMergedCourses,
    enabled: false, // Don't run automatically on mount, let refreshData handle it
  });

  const refreshData = useCallback(async (shouldFetchRemote = true) => {
    if (!setAllCourses || !updateUser) {
      console.warn("Refresh data called before context was available.");
      return;
    }
    
    setGlobalRefreshing(true);
    try {
      console.log("🔄 Global Refresh Triggered...");

      const storedUser = await AsyncStorage.getItem("@user_data");
      if (storedUser) {
        updateUser(JSON.parse(storedUser));
      }

      if (shouldFetchRemote) {
        const { data } = await refetch();
        if (data) {
          setAllCourses(data);
          console.log("✅ Remote Fetch Complete via React Query");
        }
      } else {
        const cached = queryClient.getQueryData(["allCourses"]);
        if (cached) {
          setAllCourses(cached);
          console.log("📦 Cache found via React Query. Updating UI immediately.");
        } else {
          const { data } = await refetch();
          if (data) {
             setAllCourses(data);
          }
        }
      }

    } catch (error) {
      console.error("❌ Refresh failed:", error);
    } finally {
      setGlobalRefreshing(false);
    }
  }, [setAllCourses, updateUser, refetch, queryClient]);

  return { refreshData, globalRefreshing };
};
