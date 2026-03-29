import { collection, getDocs } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebaseConfig";


export const getAllCoursesWithSubcollections = async () => {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Check the EXPO_PUBLIC_FIREBASE_* values before fetching courses."
    );
  }

  try {
    const coursesSnapshot = await getDocs(collection(db, "courses"));

    const allCourses = await Promise.all(
      coursesSnapshot.docs.map(async (courseDoc) => {
        const courseId = courseDoc.id;
        const courseData = courseDoc.data();

        const [modulesSnapshot, flashcardsSnapshot, quizzesSnapshot] =
          await Promise.all([
            getDocs(collection(db, "courses", courseId, "modules")),
            getDocs(collection(db, "courses", courseId, "flashcards")),
            getDocs(collection(db, "courses", courseId, "quizzes")),
          ]);

        const modules = modulesSnapshot.docs.map((doc) => {
          const data = doc.data();
          const moduleId = doc.id;
          const associatedFlashcards =
            flashcardsSnapshot.docs.find((f) => f.id === `flashcard_${moduleId}`)
              ?.data()?.flashcards || [];
          const associatedQuiz =
            quizzesSnapshot.docs.find((q) => q.id === `quiz_${moduleId}`)?.data()
              ?.quiz || [];

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
          flashcards: flashcardsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
          quizzes: quizzesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        };
      })
    );

    return allCourses;
  } catch (error) {
    console.error("Error fetching courses and subcollections:", error);
    throw error;
  }
};
