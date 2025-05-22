import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import * as Progress from "react-native-progress";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../../components/shared/Button";
import colors from "../../../constants/colors";
import { allCoursesContext } from "../../../context/context";
export default function QuizId() {
  const { quizId } = useLocalSearchParams();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedOption, setSelectedOption] = useState();
  const [result, setResult] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [shuffledOptions, setShuffledOptions] = useState([]);
  // const { setShowConfetti } = useContext(showConfettiContext);
  const { selectedCourse, selectedQuiz } = useContext(allCoursesContext);
  const courseTitle = selectedCourse?.title;
  const quizTitle = selectedQuiz?.title;
  // console.log("selectedCourse", selectedCourseTitle, selectedQuizTitle);
  const quiz = selectedQuiz?.quiz;

  useEffect(() => {
    if (quiz[currentPage]?.options) {
      const valuesOnly = quiz[currentPage].options.map(
        (optionObj) => Object.values(optionObj)[0]
      );

      setShuffledOptions([...valuesOnly].sort(() => Math.random() - 0.5));
    }
    const timer = setTimeout(() => {}, 5000);

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [quiz, currentPage]);

  const getProgress = (currentPage) => {
    const precentage = currentPage / quiz?.length;
    return precentage;
  };

  const onOptionSelect = (selectedChoice) => {
    setResult((prev) => ({
      ...prev,
      [currentPage]: {
        userChoice: selectedChoice,
        isCorrect: quiz[currentPage]?.correctAnswer === selectedChoice,
        question: quiz[currentPage]?.question,
        correctAns: quiz[currentPage]?.correctAnswer,
        explanation: quiz[currentPage]?.explanation || "",
      },
    }));
  };

  const calculateQuizPercent = () => {
    if (!quiz || !result) return 0;

    const correctAnswers = Object.values(result).filter(
      (q) => q.isCorrect
    ).length;
    const totalQuestions = quiz.length;

    return ((correctAnswers / totalQuestions) * 100).toFixed(0);
  };

  const goBack = () => {
    Alert.alert(
      "Confirm Exit",
      "Are you sure you want to go back? You will lose your progress.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const onQuizFinish = async () => {
    setLoading(true);
    console.log("result of the quiz", result);

    const quizResultPercentage = calculateQuizPercent();

    const quizData = {
      quizId,
      result,
      quizResultPercentage,
      courseTitle,
      quizTitle,
    };

    router.replace({
      pathname: "/quiz/quizResultScreen",
      params: {
        quizIdParam: JSON.stringify(quizData),
      },
    });
  };

  if (!quiz) {
    return <ActivityIndicator size="large" color={colors.WHITE} />;
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 10,
        backgroundColor: colors.BACKGROUND,
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 10,
        }}
      >
        <Pressable onPress={goBack}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </Pressable>

        <Text
          style={{
            fontFamily: "Poppins-Bold",
            fontSize: 25,
            color: colors.BLACK,
          }}
        >
          {currentPage + 1} / {quiz?.length}
        </Text>
      </View>

      <Text
        style={{
          textAlign: "center",
          fontFamily: "Poppins-Regular",
          fontSize: 18,
          padding: 10,
          color: colors.BLACK,
        }}
      >
        {selectedCourse?.title}
      </Text>
      <View style={{ marginTop: 10, alignSelf: "center" }}>
        <Progress.Bar
          progress={getProgress(currentPage)}
          width={Dimensions.get("window").width * 0.85}
          color={colors.PRIMARY}
          height={8}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          paddingHorizontal: 25,
          paddingVertical: 20,
          backgroundColor: colors.WHITE,
          marginTop: 20,
          elevation: 1,
          borderRadius: 20,
          flexGrow: 1,
          paddingBottom: 100,
        }}
      >
        <Text
          style={{
            fontFamily: "Poppins-Bold",
            fontSize: 18,
            textAlign: "center",
          }}
        >
          {quiz[currentPage]?.question}
        </Text>
        {shuffledOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setSelectedOption(index);
              onOptionSelect(item);
            }}
            style={{
              padding: 20,
              borderWidth: 1,
              borderRadius: 15,
              marginTop: 8,
              backgroundColor: selectedOption === index ? colors.PRIMARY : null,

              borderColor: selectedOption === index ? colors.GREEN : null,
            }}
          >
            <Text
              style={{
                fontFamily: "Poppins-Regular",
                fontSize: 17,
                color: selectedOption === index ? colors.WHITE : null,
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            paddingTop: 10,
            marginTop: "10",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        ></View>
      </ScrollView>
      <View>
        {selectedOption?.toString() && quiz?.length - 1 > currentPage && (
          <Button
            text={"Next"}
            onPress={() => {
              setCurrentPage(currentPage + 1);
              setSelectedOption(null);
            }}
          />
        )}
        {selectedOption?.toString() && quiz?.length - 1 === currentPage && (
          <Button
            text={"Finish"}
            onPress={() => {
              onQuizFinish();
            }}
            loading={loading}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Optional overlay
    zIndex: 9999, // Make sure it overlays on top of other components
  },
  hintButton: {
    height: 70,
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: 5,
    marginRight: 10,
  },
  hintIcon: {
    height: 40,
    width: 40,
  },
  hintText: {
    fontFamily: "Poppins-Regular",
    fontSize: 10,
    marginTop: 5,
    color: "#333",
  },
  hintBox: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    minHeight: 20,
    justifyContent: "center",
  },
  hintMessage: {
    fontSize: 13,
    color: "#444",
  },
});
