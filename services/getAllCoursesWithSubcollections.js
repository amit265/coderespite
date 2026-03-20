import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";


export const getAllCoursesWithSubcollections = async () => {
  try {
    // Step 1: Fetch all courses
    const coursesSnapshot = await getDocs(collection(db, "courses"));
    
    // Step 2: Fetch subcollections for all courses in parallel
    const allCourses = await Promise.all(coursesSnapshot.docs.map(async (courseDoc) => {
      const courseId = courseDoc.id;
      const courseData = courseDoc.data();

      // Fetch subcollections in parallel for each course
      const [modulesSnapshot, flashcardsSnapshot, quizzesSnapshot] = await Promise.all([
        getDocs(collection(db, "courses", courseId, "modules")),
        getDocs(collection(db, "courses", courseId, "flashcards")),
        getDocs(collection(db, "courses", courseId, "quizzes"))
      ]);

      const modules = modulesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const flashcards = flashcardsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const quizzes = quizzesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        id: courseId,
        ...courseData,
        modules,
        flashcards,
        quizzes,
      };
    }));

    await AsyncStorage.setItem("@allCourses_data", JSON.stringify(allCourses));

    return allCourses;
  } catch (error) {
    console.error("Error fetching courses and subcollections:", error);
    return [];
  }
};
