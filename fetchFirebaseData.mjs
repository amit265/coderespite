import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchCourses() {
  console.log("Fetching courses from Firebase...");
  const coursesSnapshot = await getDocs(collection(db, "courses"));
  
  const allCourses = await Promise.all(
    coursesSnapshot.docs.map(async (courseDoc) => {
      const courseId = courseDoc.id;
      const courseData = courseDoc.data();

      const [modulesSnapshot, flashcardsSnapshot, quizzesSnapshot] = await Promise.all([
        getDocs(collection(db, "courses", courseId, "modules")),
        getDocs(collection(db, "courses", courseId, "flashcards")),
        getDocs(collection(db, "courses", courseId, "quizzes")),
      ]);

      const modules = modulesSnapshot.docs.map((doc) => {
        const data = doc.data();
        const moduleId = doc.id;
        const associatedFlashcards = flashcardsSnapshot.docs.find((f) => f.id === `flashcard_${moduleId}`)?.data()?.flashcards || [];
        const associatedQuiz = quizzesSnapshot.docs.find((q) => q.id === `quiz_${moduleId}`)?.data()?.quiz || [];
        
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
        flashcards: flashcardsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        quizzes: quizzesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      };
    })
  );

  fs.writeFileSync("assets/data/all_courses_bundled.json", JSON.stringify(allCourses, null, 2));
  console.log("Successfully saved courses to assets/data/all_courses_bundled.json");
  process.exit(0);
}

fetchCourses().catch(console.error);
