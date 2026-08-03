export function generateLastNDaysData(progress = {}, activityLog = [], n = 90) {
  const data = [];
  const today = new Date();

  // 1. Gather all activity dates
  const activityCounts = {};

  if (progress && typeof progress === "object") {
    Object.values(progress).forEach(courseProgress => {
      if (!courseProgress) return;
      
      // A. Flashcards viewed
      if (Array.isArray(courseProgress.flashcardsViewed)) {
        courseProgress.flashcardsViewed.forEach(fc => {
          if (fc && fc.date) {
            activityCounts[fc.date] = (activityCounts[fc.date] || 0) + 1;
          }
        });
      }
      
      // B. Flashcards loved
      if (Array.isArray(courseProgress.flashcardsLoved)) {
        courseProgress.flashcardsLoved.forEach(fc => {
          if (fc && fc.date) {
            activityCounts[fc.date] = (activityCounts[fc.date] || 0) + 1;
          }
        });
      }
      
      // C. Quizzes attempted
      if (Array.isArray(courseProgress.attemptedQuizzes)) {
        courseProgress.attemptedQuizzes.forEach(quiz => {
          if (quiz && quiz.date) {
            activityCounts[quiz.date] = (activityCounts[quiz.date] || 0) + 1;
          }
        });
      }
    });
  }

  // 1.5. Aggregate new global activity log
  if (Array.isArray(activityLog)) {
    activityLog.forEach(dateStr => {
      if (dateStr) {
        activityCounts[dateStr] = (activityCounts[dateStr] || 0) + 1;
      }
    });
  }

  // Get the date n days ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (n - 1));

  // Pad the beginning to align to Sunday
  const startDay = startDate.getDay(); // 0 = Sunday, 6 = Saturday
  for (let i = 0; i < startDay; i++) {
    data.push({
      date: null, // Empty square
      count: 0,
    });
  }

  // Add actual data
  for (let i = 0; i < n; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateString = date.toISOString().slice(0, 10);
    
    data.push({
      date: dateString,
      count: activityCounts[dateString] || 0,
    });
  }

  return data;
}