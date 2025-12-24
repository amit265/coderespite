import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { courseIcons } from "../constants/constants";
import { adConfigContext } from "../context/context";
import { timeLapse } from "../services/currentTime";

export default function QuizHistoryCard({ quizData }) {
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);
  const { width } = useWindowDimensions(); // for full screen width

  const sortedQuizData = quizData.sort(
    (a, b) => b?.attemptedDate - a?.attemptedDate
  );

  const renderQuizData = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.cardWrapper, { width: width - 32 }]} // full width minus horizontal padding
        onPress={() => {
          setClickCount((prev) => prev + 1);
          router.replace({
            pathname: "/quiz/quizResultScreen",
            params: {
              quizIdParam: JSON.stringify(item),
              history: true
            },
          });
        }}
        activeOpacity={0.85}
      >
        <View style={styles.card}>
          {/* Image */}
          <Image
            source={
              courseIcons[item?.quizIcon] ||
              require("../assets/default-icon.png")
            }
            style={styles.image}
          />

          {/* Text Content */}
          <View style={styles.content}>
            <Text
              numberOfLines={1}
              style={styles.quizTitle}
            >
              {item?.quizTitle}
            </Text>
            <Text style={styles.attemptedDate}>
              {timeLapse(item?.attemptedDate)}
            </Text>
            <View style={styles.courseTag}>
              <Text style={styles.courseText}>{item?.courseTitle}</Text>
            </View>
          </View>

          {/* Score Badge */}
          <View style={styles.resultContainer}>
            <AntDesign
              name="checksquare"
              size={20}
              color={item?.quizResultPercentage > 60 ? "green" : "red"}
            />
            <Text
              style={[
                styles.resultText,
                { color: item?.quizResultPercentage > 60 ? "green" : "red" },
              ]}
            >
              {item?.quizResultPercentage}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={sortedQuizData}
      renderItem={renderQuizData}
      keyExtractor={(_, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20, alignItems: "center" }} // centers content
    />
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    fontFamily: "Nunito-Bold",
  },
  attemptedDate: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
    fontFamily: "Nunito",
  },
  courseTag: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  courseText: {
    fontSize: 13,
    color: "#333",
    fontFamily: "Nunito",
  },
  resultContainer: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  resultText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
  },
});
