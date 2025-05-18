import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import FlipCard from "react-native-flip-card";
import * as Progress from "react-native-progress";
import colors from "../../constants/colors";
import flashcard from "../../data/javascript/flashcards.json";

export default function FlashCards() {
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const screenWidth = Dimensions.get("screen").width;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].index);
    }
  };

  const getProgress = (currentPage) => {
    if (flashcard?.length <= 1) return 1;
    return currentPage / (flashcard.length - 1);
  };

  return (
    <View className="flex-1 bg-[#F3FAFE]">
      {/* Header Image */}
      <Image
        source={require("../../assets/images/1.png")}
        style={{ height: 500, width: "100%" }}
        resizeMode="cover"
      />

      {/* Overlay content */}
      <View className="absolute top-0 left-0 right-0 p-6">
        {/* Top Bar */}
        <View className="flex-row justify-between items-center">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </Pressable>
          <Text className="text-black font-bold text-xl">
            {currentPage + 1} / {flashcard?.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="mt-6">
          <Progress.Bar
            progress={getProgress(currentPage)}
            width={screenWidth * 0.85}
            color={colors.BLACK}
            height={8}
            unfilledColor="rgba(0,0,0,0.5)"
            borderWidth={0}
          />
        </View>

        {/* Flashcards */}
        <FlatList
          data={flashcard}
          pagingEnabled
          horizontal
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View className="mt-24 h-[500px]">
              <FlipCard
                style={{
                  width: screenWidth * 0.78,
                  height: 400,
                  borderRadius: 20,
                  marginHorizontal: screenWidth * 0.05,
                }}
                friction={12} // Increase for slower, smoother flip
                perspective={1500} // More realistic 3D effect
                flipHorizontal
                flipVertical={false}
                clickable
                useNativeDriver={true} // Use native animations
              >
                {/* Front Side */}
                <View className="bg-white flex-1 rounded-2xl justify-center items-center px-4">
                  <Text className="text-2xl font-bold text-center text-gray-800">
                    {item?.question}
                  </Text>
                </View>

                {/* Back Side */}
                <View
                  className="bg-[#FF6B6B] flex-1 rounded-2xl justify-center items-center px-4"
                  style={{ backgroundColor: colors.PRIMARY }}
                >
                  <Text className="text-white text-2xl text-center font-medium py-8">
                    {item?.answer}
                  </Text>
                  <Text className="text-white text-xl text-center font-medium py-8">
                    {item?.explanation}
                  </Text>
                </View>
              </FlipCard>
            </View>
          )}
        />
      </View>
    </View>
  );
}
