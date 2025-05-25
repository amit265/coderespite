import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { courseIcons } from "../constants/constants";
import { adConfigContext } from "../context/context";

export default function QuizHistoryCard({ quizData }) {
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);
  const sortQuizData = quizData.sort(
    (a, b) => b?.attemptedDate - a?.attemptedDate
  );

  const renderQuizData = ({ item }) => {
    console.log("item from flatlist", item);

    return (
      <TouchableOpacity
        className="mb-4 shadow shadow-black"
        onPress={() => {
          setClickCount((prev) => prev + 1);
          router.replace({
            pathname: "/quiz/quizResultScreen",
            params: {
              quizIdParam: JSON.stringify(item),
            },
          });
        }}
      >
        <View className="flex flex-row gap-2 bg-white p-4 rounded-lg shadow">
          <View style={{ width: 100, height: 100 }}>
            <Image
              source={courseIcons[item?.quizIcon]}
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover",
                borderRadius: 20,
              }}
            />
            {/* <View style={{position: "absolute", right:"40%", bottom: "40%"}}>
                <View className="flex flex-row">
                  <AntDesign
                    name="checksquare"
                    size={24}
                    color={item?.quizResultPercentage > 0 ? "green" : "red"}
                  />
                 
                </View>
              </View> */}
          </View>
          <View className="flex gap-2 px-2 justify-center items-start">
            <Text className="text-lg font-nunito-bold">
              {item?.quizTitle?.length > 20
                ? item?.quizTitle.slice(0, 20) + "..."
                : item?.quizTitle}
            </Text>
            <Text className="text-base font-nunito text-gray-500">
              {item?.attemptedDate}
            </Text>

            <View className="flex flex-row">
              <Text className="text-base border px-2 rounded-lg font-nunito text-gray-800">
                {item?.courseTitle}
              </Text>
            </View>
          </View>
          <View style={{ position: "absolute", right: 16, bottom: 16 }}>
            <View className="flex flex-row">
              <AntDesign
                name="checksquare"
                size={24}
                color={item?.quizResultPercentage > 60 ? "green" : "red"}
              />
              <Text
                style={{
                  color: item?.quizResultPercentage > 60 ? "green" : "red",
                  marginLeft: 5,
                }}
              >
                {item?.quizResultPercentage}%
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <FlatList
      data={sortQuizData}
      renderItem={renderQuizData}
      keyExtractor={(_, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
