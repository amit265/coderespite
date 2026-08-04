import AsyncStorage from "./storage";

// Leitner Box Intervals (in days)
const BOX_INTERVALS = {
  1: 1, // Box 1: review in 1 day
  2: 3, // Box 2: review in 3 days
  3: 7, // Box 3: review in 7 days
};

export const getSRSData = async () => {
  try {
    const data = await AsyncStorage.getItem("@srs_flashcards_metadata");
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.error("Error reading SRS data:", err);
    return {};
  }
};

export const saveSRSData = async (srsData) => {
  try {
    await AsyncStorage.setItem("@srs_flashcards_metadata", JSON.stringify(srsData));
  } catch (err) {
    console.error("Error writing SRS data:", err);
  }
};

/**
 * Registers or initializes a flashcard into the SRS Leitner queue.
 */
export const registerFlashcardInSRS = async (flashcard, courseTitle, moduleTitle) => {
  const srsData = await getSRSData();
  const key = flashcard.question;

  // Don't overwrite if it already exists
  if (srsData[key]) return;

  const todayStr = new Date().toISOString().split("T")[0];
  srsData[key] = {
    question: flashcard.question,
    answer: flashcard.answer,
    courseTitle: courseTitle || "",
    moduleTitle: moduleTitle || "",
    box: 1,
    lastReviewed: todayStr,
    nextReview: todayStr, // Due immediately when registered
  };

  await saveSRSData(srsData);
};

/**
 * Updates a card's review interval based on correctness.
 * @param {string} question - The flashcard question (key)
 * @param {boolean} gotItRight - If true, card moves up boxes; if false, resets to Box 1
 */
export const reviewFlashcard = async (question, gotItRight) => {
  const srsData = await getSRSData();
  const card = srsData[question];
  if (!card) return;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  let nextBox = card.box;
  if (gotItRight) {
    nextBox = Math.min(card.box + 1, 3); // Max Box 3
  } else {
    nextBox = 1; // Reset to Box 1 on failure
  }

  const daysToAdd = BOX_INTERVALS[nextBox];
  const nextDate = new Date();
  nextDate.setDate(today.getDate() + daysToAdd);
  const nextReviewStr = nextDate.toISOString().split("T")[0];

  srsData[question] = {
    ...card,
    box: nextBox,
    lastReviewed: todayStr,
    nextReview: nextReviewStr,
  };

  await saveSRSData(srsData);
};

/**
 * Fetches all cards currently due for review (nextReviewDate <= today)
 */
export const getDueFlashcards = async () => {
  const srsData = await getSRSData();
  const todayStr = new Date().toISOString().split("T")[0];
  
  return Object.values(srsData).filter((card) => {
    return card.nextReview <= todayStr;
  });
};

/**
 * Removes a flashcard from the SRS system (e.g., when un-loved/un-favorited)
 */
export const removeFlashcardFromSRS = async (question) => {
  const srsData = await getSRSData();
  if (srsData[question]) {
    delete srsData[question];
    await saveSRSData(srsData);
  }
};
