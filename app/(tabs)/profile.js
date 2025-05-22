import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Text, View } from "react-native";
import SafeScreen from "../../components/SafeScreen";
import StreakHeatmap from "../../components/StreakHeatmap";
import { db } from "../../services/firebaseConfig";
import { generateLastNDaysData } from "../../services/generateLastNDaysData";
import { getAllCoursesWithSubcollections } from "../../services/getAllCoursesWithSubcollections";

export default function Profile() {
  // const data = [
  //   { count: 3, date: "2025-05-14" },
  //   { count: 5, date: "2025-05-15" },
  // ];
  const data = useMemo(() => generateLastNDaysData(60), []); // 13 weeks x 7 days
  // console.log("data", data);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  console.log("totalCount", totalCount);




  // console.log("dataaaa", dataa);

  return (
    <SafeScreen>
      <Text>profile</Text>
      <View style={{ flex: 1, alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 12 }}>Your Streak</Text>
        <Text className="text-left p-2 text-sm w-full">
          {totalCount} days in the last 60 days
        </Text>
        <View className="border border-gray-400 w-full rounded-lg p-4">
          <StreakHeatmap data={data} />
        </View>
        <View style={{ marginTop: 40 }}>
          <Button
            title="Upload All Data to Firestore"
            onPress={getAllCoursesWithSubcollections}
          />
        </View>
      </View>
    </SafeScreen>
  );
}
