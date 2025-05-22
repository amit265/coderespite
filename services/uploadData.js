import { doc, setDoc } from "firebase/firestore";
import { courseFiles } from "../assets/data/manifest";
import { db } from "./firebaseConfig";

import courses from "../assets/data/courses.json";
import dailyTips from "../assets/data/dailyTip.json";
import users from "../assets/data/users.json";

// const readJSONFromAsset = async (assetModule) => {
//   if (Array.isArray(assetModule)) {
//     console.error(
//       "❌ assetModule is an array! Expected a single asset module.",
//       assetModule
//     );
//     return null;
//   }
//   try {
//     const asset = Asset.fromModule(assetModule);
//     await asset.downloadAsync();
//     const content = await FileSystem.readAsStringAsync(
//       asset.localUri || asset.uri
//     );
//     return JSON.parse(content);
//   } catch (e) {
//     console.error("❌ Failed to read asset:", e);
//     return null;
//   }
// };

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
      if (!file || !file.module || Array.isArray(file.module)) {
        console.warn(
          `⚠️ Skipping invalid module for ${file?.filename || "unknown"}`
        );
        continue;
      }

      const json = file.module; // ✅ Directly use the required JSON
      console.log("logging", json);

      if (!json) {
        console.warn(`Failed to read ${file.filename} for course ${courseId}`);
        continue;
      }

      const docId = file.filename.replace(".json", "");
      console.log("docid", docId, courseId, json);

      await setDoc(doc(db, "courses", courseId, type, docId), json);
      console.log(`✅ Uploaded courses/${courseId}/${type}/${docId}`);
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
