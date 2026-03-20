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

      const modules = modulesSnapshot.docs.map((doc) => {
        const data = doc.data();
        const moduleId = doc.id;
        
        // Find associated flashcards and quiz for this module
        // Filename pattern is flashcard_module01.json, quiz_module01.json
        const associatedFlashcards = flashcardsSnapshot.docs.find(f => f.id === `flashcard_${moduleId}`)?.data()?.flashcards || [];
        const associatedQuiz = quizzesSnapshot.docs.find(q => q.id === `quiz_${moduleId}`)?.data()?.quiz || [];

        return {
          id: moduleId,
          ...data,
          flashcards: associatedFlashcards,
          quiz: associatedQuiz,
        };
      });

      return {
        id: courseId,
        ...courseData,
        modules,
        flashcards: flashcardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        quizzes: quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      };
    }));

    await AsyncStorage.setItem("@allCourses_data", JSON.stringify(allCourses));

    return allCourses;
  } catch (error) {
    console.error("Error fetching courses and subcollections:", error);
    return [];
  }
};
