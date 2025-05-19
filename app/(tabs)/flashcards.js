import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
    Text,
  View,
} from "react-native";
import FlipCard from "react-native-flip-card";
import colors from "../../constants/colors";
import flashcard from "../../data/javascript/flashcards.json";
import SafeScreen from "../../components/SafeScreen"

export default function FlashCards() {
  const router = useRouter();
  const screenWidth = Dimensions.get("screen").width;

  return (
    
    <SafeScreen>
      {/* Overlay content */}
      {/* Top Bar */}
      <View className="flex-row gap-4 items-center justify-between px-1">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </Pressable>
        <Text className="text-black font-bold text-2xl">Flashcards</Text>
        <Ionicons name="heart" size={28} color="red" />
      </View>

      {/* Flashcards */}
      <FlatList
        data={flashcard}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="mt-12 mx-auto">
            <FlipCard
              style={{
                width: screenWidth * 0.78,
                height: 200,
                borderRadius: 20,
                marginHorizontal: screenWidth * 0.05,
              }}
              friction={12} // Increase for slower, smoother flip
              perspective={1500} // More realistic 3D effect
              flipVertical
              clickable
            >
              {/* Front Side */}
              <View className="bg-white flex-1 rounded-2xl justify-center items-center px-14">
                <Pressable
                  style={{
                    position: "absolute",
                    bottom: 20,
                    zIndex: 50,
                  }}
                  onPress={() => Alert.alert("you bookmarked this")}
                >
                  <Ionicons name="heart-outline" size={20} color="black" />
                </Pressable>

                <Text className="text-lg font-bold text-center text-gray-800">
                  {item?.question}
                </Text>
              </View>

              {/* Back Side */}
              <View
                className="flex-1 rounded-2xl justify-center items-center px-4"
                style={{ backgroundColor: colors.PRIMARY }}
              >
                <Text className="text-white text-xl text-center font-medium py-2">
                  {item?.answer}
                </Text>
                <Text className="text-white text-sm text-center font-medium py-2">
                  {item?.explanation}
                </Text>
              </View>
            </FlipCard>
          </View>
        )}
      />
    </SafeScreen>
  );
}
