import AsyncStorage from "./storage";

// We keep this key in case we want to store *only* custom AI-generated courses in the future
const CUSTOM_COURSES_KEY = "@custom_ai_courses";

export const getAllCoursesWithSubcollections = async () => {
  try {
    // 1. Load the bundled local JSON
    const bundledCourses = require("../assets/data/all_courses_bundled.json");
    
    // 2. Try to load custom AI-generated courses from cache
    const customCached = await AsyncStorage.getItem(CUSTOM_COURSES_KEY);
    const customCourses = customCached ? JSON.parse(customCached) : [];
    
    // 3. Merge them and return
    return [...bundledCourses, ...customCourses];
  } catch (error) {
    console.error("Error loading courses:", error);
    // Fallback to static require if something fails
    return require("../assets/data/all_courses_bundled.json");
  }
};
