import { doc, setDoc } from "firebase/firestore";
import { courseFiles } from "../assets/data/manifest";
import { db } from "./firebaseConfig";

import courses from "../assets/data/courses.json";
import dailyTips from "../assets/data/dailyTip.json";
import users from "../assets/data/users.json";

const uploadCourseData = async (courseId) => {
  const course = courseFiles[courseId];
  if (!course) {
    console.warn(`No files registered for course ${courseId}`);
    return;
  }

  for (const type of ["modules", "flashcards", "quizzes"]) {
    const files = course[type];
    if (!files) continue;

    for (const file of files) {
      if (!file.module || !Array.isArray(file.module)) {
        console.warn(
          `⚠️ Skipping invalid module for ${file?.filename || "unknown"}`
        );
        continue;
      }

      file.module.forEach(async (json, index) => {
        if (!json) {
          console.warn(
            `⚠️ Skipping empty item at index ${index} in ${file.filename}`
          );
          return;
        }

        // Make docId unique per item
        const baseDocId = file.filename.replace(".json", "");
        const docId = `${baseDocId}_${index + 1}`;

        console.log("Uploading:", courseId, type, docId, json);

        try {
          await setDoc(doc(db, "courses", courseId, type, docId), json);
          console.log(`✅ Uploaded courses/${courseId}/${type}/${docId}`);
        } catch (error) {
          console.error(`❌ Error uploading ${docId}:`, error);
        }
      });
    }
  }
};


export const uploadAllData = async () => {
  try {
    // courses is already an array imported
    for (const courseData of courses) {
      if (!courseData.id) {
        console.warn("Course missing id:", courseData);
        continue;
      }
      const courseId = courseData.id;
      await setDoc(doc(db, "courses", courseId), courseData);
      await uploadCourseData(courseId);
    }

    // dailyTips is an array imported
    for (const tipData of dailyTips) {
      if (!tipData.id) {
        console.warn("Tip missing id:", tipData);
        continue;
      }
      await setDoc(doc(db, "dailyTips", tipData.id), tipData);
    }

    // users is an array imported
    for (const userData of users) {
      if (!userData.id) {
        console.warn("User missing id:", userData);
        continue;
      }
      await setDoc(doc(db, "users", userData.id), userData);
    }

    console.log("🎉 All data uploaded to Firestore!");
  } catch (err) {
    console.error("❌ Error uploading data:", err);
  }
};
