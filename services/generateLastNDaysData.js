export function generateLastNDaysData(n = 90) {
    const data = [];
    const today = new Date();
  
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
      data.push({
        date: date.toISOString().slice(0, 10),
        count: Math.floor(Math.random() * 6), // or real count
      });
    }
  
    return data;
  }
  