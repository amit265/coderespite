import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";


export const getAllCoursesWithSubcollections = async () => {
  
  try {
    // Step 1: Fetch all courses
    const coursesSnapshot = await getDocs(collection(db, "courses"));
    const allCourses = [];
    console.log("log all data from upload");
    
    for (const courseDoc of coursesSnapshot.docs) {
      const courseId = courseDoc.id;
      const courseData = courseDoc.data();
      // console.log("courseData", courseData);

      // Step 2: Fetch subcollections (e.g., modules)
      const modulesSnapshot = await getDocs(
        collection(db, "courses", courseId, "modules")
      );
      const modules = modulesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // console.log("modules", modules);

      // You can repeat for flashcards or quizzes if needed:
      const flashcardsSnapshot = await getDocs(
        collection(db, "courses", courseId, "flashcards")
      );
      const flashcards = flashcardsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const quizzesSnapshot = await getDocs(
        collection(db, "courses", courseId, "quizzes")
      );
      const quizzes = quizzesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Combine everything
      allCourses.push({
        id: courseId,
        ...courseData,
        modules,
        flashcards,
        quizzes,
        // flashcards, // Add if fetched
      });
    }
    // console.log("from firestore allCourses", allCourses);

    await AsyncStorage.setItem("@allCourses_data", JSON.stringify(allCourses));

    return allCourses;
  } catch (error) {
    console.error("Error fetching courses and subcollections:", error);
  }
};
