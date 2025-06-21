import { useRouter } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, Text, View } from "react-native";
import ProgressBar from "../../components/home/ProgressBar";
import ProfileModal from "../../components/ProfileModal";
import QuickStats from "../../components/QuickStats";
import SafeScreen from "../../components/SafeScreen";
import Button from "../../components/shared/Button";
import UserCard from "../../components/UserCard";
import { userDetailsContext } from "../../context/context";
import { generateLastNDaysData } from "../../services/generateLastNDaysData";
import { uploadAllData } from "../../services/uploadData";
import { clearAllData, logAllAsyncStorage } from "../../services/userStorage";
export default function Profile() {
  const { userData } = useContext(userDetailsContext);
  console.log("userData from profile", userData);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const show = true;
  // const data = [
  //   { count: 3, date: "2025-05-14" },
  //   { count: 5, date: "2025-05-15" },

  // ];
  useEffect(() => {
    const username = userData?.profile?.name ?? ""; // fallback to empty string if undefined or null

    if (username === "user" || username === "") {
      setShowModal(true);
    }
  }, [userData]); // add dependency if userData is coming from async source

  // const data = useMemo(() => generateLastNDaysData(60), []); // 13 weeks x 7 days
  // console.log("data", data);
  // const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  // console.log("totalCount", totalCount);
  // const addUser = async () => {
  //   const userdetails = await AsyncStorage.getItem(
  //     "user",
  //     JSON.stringify(user)
  //   );
  // };
  // console.log("dataaaa", dataa);

  return (
    <SafeScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Text className="text-2xl font-nunito-bold mb-4 text-black text-center py-2">
            Profile
          </Text>
        </View>
        {/* <View style={{ flex: 1, alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 12 }}>Your Streak</Text>
        <Text className="text-left p-2 text-sm w-full">
          {totalCount} days in the last 60 days
        </Text>
        <View className="border border-gray-400 w-full rounded-lg p-4">
          <StreakHeatmap data={data} />
        </View>
        <View style={{ marginTop: 40 }}>
          <Button title="Upload All Data to Firestore" onPress={addUser} />
        </View>
      </View> */}

        <View className="px-4">
          <UserCard userData={userData} setShowModal={setShowModal} />
        </View>
        <View className="px-4 bg-white mx-4 rounded-lg mt-4 pb-4">
          <ProgressBar />
        </View>
        <View className="px-4">
          <QuickStats userData={userData} />
        </View>

        {show && (
          <View>
            <View className="px-4">
              <Button text={"Clear all data"} type onPress={clearAllData} />
            </View>

            <View className="px-4">
              <Button text={"log all data"} type onPress={logAllAsyncStorage} />
            </View>

            <View className="px-4">
              <Button text={"upload all data"} type onPress={uploadAllData} />
            </View>
          </View>
        )}

        <View className="px-4">
          <Button
            text={"Quiz History"}
            type
            onPress={() => router.push("/quizHistory")}
          />
        </View>
        <View className="px-4" style={{ marginBottom: 20 }}>
          <Button
            text={"Favorite FlashCards"}
            type
            onPress={() => router.push("/flashcards/favoritesFc")}
          />
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                width: "90%",
                backgroundColor: "white",
                borderRadius: 10,
                padding: 20,
              }}
            >
              <ProfileModal setShowModal={setShowModal} />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeScreen>
  );
}
