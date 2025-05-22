import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Modal, Text, View } from "react-native";
import user from "../../assets/data/users.json";
import QuickStats from "../../components/QuickStats";
import SafeScreen from "../../components/SafeScreen";
import UserCard from "../../components/UserCard";
import { userDetailsContext } from "../../context/context";
import { generateLastNDaysData } from "../../services/generateLastNDaysData";
import ProfileModal from "../../components/ProfileModal";
export default function Profile() {
  const { userDetails, setUserDetails } = useContext(userDetailsContext);
  const [showModal, setShowModal] = useState(false);
  console.log("userdetails from profile", userDetails);

  // const data = [
  //   { count: 3, date: "2025-05-14" },
  //   { count: 5, date: "2025-05-15" },

  // ];

  useEffect(() => {});
  const data = useMemo(() => generateLastNDaysData(60), []); // 13 weeks x 7 days
  // console.log("data", data);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  console.log("totalCount", totalCount);
  const addUser = async () => {
    const userdetails = await AsyncStorage.getItem(
      "user",
      JSON.stringify(user)
    );
    console.log("userdetails", userdetails);
  };
  // console.log("dataaaa", dataa);

  return (
    <SafeScreen>
      <View className="p-4">
        <Text className="text-center font-bold text-2xl">Profile</Text>
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

      <View className="p-4">
        <UserCard userDetails={userDetails} setShowModal={setShowModal}/>
      </View>
      <View className="p-4">
        <QuickStats userDetails={userDetails} />
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
            <ProfileModal setShowModal={setShowModal}/>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}
