import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Lottie from "lottie-react";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import funAnimation from "../../assets/fun.json";
import SafeScreen from "../../components/SafeScreen";
import Button from "../../components/shared/Button";
import colors from "../../constants/colors";
import { allCoursesContext, userDetailsContext } from "../../context/context";
export default function QuizResultScreen() {
  const { quizIdParam } = useLocalSearchParams();
  const { setSelectedCourse, setSelectedQuiz, allCourses } =
    useContext(allCoursesContext);
  const { gainXP } = useContext(userDetailsContext);

  const quizData = JSON.parse(quizIdParam);
  // console.log("quizdata from quiz result screen", quizData);
  // console.log("allCourse from quiz result screen", allCourses);
  // console.log("selectedQuiz from quiz result screen", selectedQuiz);
  // console.log("selectedCourse from quiz result screen", selectedCourse);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  // console.log("quiz id from result screen", quizId);
  const getPercMarks = quizData?.quizResultPercentage;
  const quizResult = quizData?.result || {};

  // console.log("showConfetti", showConfetti);

  useEffect(() => {
    const init = async () => {
      await gainXP(getPercMarks * 0.5);
    };
    init();

    console.log("xp increasinf in quiz result screen");
  }, []);
  useEffect(() => {
    if (!quizData) {
      setLoading(true);
    }
    if (
      quizData &&
      Object.keys(quizData.result || {}).length > 0 &&
      getPercMarks > 60
    ) {
      setLoading(false);

      setTimeout(() => setShowConfetti(true), 1000); // Small delay to ensure proper rendering
    }
  }, []);

  const { correctAns, totalQuestion } = useMemo(() => {
    if (!quizData?.result) return { correctAns: 0, totalQuestion: 0 };

    const correctAns_ = Object.entries(quizData.result)?.filter(
      ([, value]) => value?.isCorrect === true
    );

    return {
      correctAns: correctAns_.length,
      totalQuestion: Object.keys(quizData.result).length,
    };
  }, [quizData]);

  const attemptAgain = () => {
    const currentCourse = allCourses.find(
      (item) => item.title === quizData?.courseTitle
    );
    const currentQuiz = currentCourse?.quizzes.find(
      (item) => item?.id === quizData?.quizId
    );
    setSelectedQuiz(currentQuiz);
    setSelectedCourse(currentCourse);
    router.push(`/quiz/courses/${quizData?.quizId}`);
  };

  const renderItem = ({ item, index }) => {
    const quizItem = item[1];

    return (
      <TouchableOpacity
        key={index}
        style={{
          padding: 20,
          borderWidth: 1,
          marginHorizontal: 5,
          marginTop: 5,
          borderRadius: 15,
          backgroundColor: quizItem?.isCorrect
            ? colors.LIGHT_GREEN
            : colors.LIGHT_RED,
          borderColor: quizItem?.isCorrect
            ? colors.LIGHT_GREEN
            : colors.LIGHT_RED,
        }}
      >
        <Text style={{ fontFamily: "nunito", fontSize: 16 }}>
          {quizItem?.question}
        </Text>
        {!quizItem?.isCorrect && (
          <Text
            style={{
              fontFamily: "nunito",
              fontSize: 15,
              color: colors.ERROR,
            }}
          >
            Your Answer: {quizItem?.userChoice}
          </Text>
        )}
        <Text
          style={{
            fontFamily: "nunito",
            fontSize: 15,
            color: colors.PRIMARY,
            marginTop: 5,
          }}
        >
          {!quizItem?.isCorrect ? "Correct Answer" : "Answer"}:{" "}
          {quizItem?.correctAns}
        </Text>
        {quizItem?.explanation && (
          <Text
            style={{
              fontFamily: "nunito",
              fontSize: 16,
              color: colors.GRAY,
              textAlign: "justify",
              marginTop: 5,
            }}
          >
            {quizItem?.explanation}
          </Text>
        )}
        {/* <View>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/quizExplainer/",
                params: {
                  questionParams: JSON.stringify(quizItem),
                },
              })
            }
          >
            <Text
              style={{
                fontFamily: "nunito",
                fontSize: 15,
                color: colors.PRIMARY,
                paddingTop: 5,
              }}
            >
              Click for more
            </Text>
          </Pressable>
        </View> */}
      </TouchableOpacity>
    );
  };

  return (
    <SafeScreen>
      <View style={{ flex: 1, backgroundColor: colors.BACKGROUND }}>
        {showConfetti && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0, // Covers the entire screen
              zIndex: 999,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Lottie
              animationData={funAnimation}
              autoPlay
              loop={false} // ✅ Run only once
              onComplete={() => setShowConfetti(false)} // ✅ Web-compatible callback
              style={{
                width: "100%",
                height: "100%",
                transform: "translateY(-100px)", // ✅ Web CSS
                position: "absolute", // Optional: to float above content
                top: 0,
                left: 0,
                pointerEvents: "none", // Optional: allows clicks to pass through
              }}
            />
          </View>
        )}
        {loading && (
          <View
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: [{ translateX: -18 }, { translateY: -18 }],
              zIndex: 999,
            }}
          >
            <ActivityIndicator color="black" size={36} />
          </View>
        )}
        <FlatList
          data={quizResult ? Object.entries(quizResult) : []}
          renderItem={renderItem}
          style={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View className="flex flex-row items-center gap-2">
                <Pressable onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={30} color="black" />
                </Pressable>
                <Text
                  style={{
                    fontFamily: "nunito-bold",
                    fontSize: 20,
                    color: colors.BLACK,
                  }}
                >
                  Quiz Summary
                </Text>
              </View>
              {quizData?.result ? (
                <View style={{ width: "100%", padding: 35 }}>
                  <View
                    style={{
                      backgroundColor: colors.WHITE,
                      padding: 20,
                      borderRadius: 20,
                      marginTop: 60,
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={require("../../assets/images/trophy.png")}
                      style={{ width: 100, height: 100, marginTop: -60 }}
                    />
                    <Text style={{ fontSize: 26, fontFamily: "nunito-bold" }}>
                      {getPercMarks > 60 ? "Congratulations" : "Try Again!"}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "nunito",
                        color: colors.GRAY,
                        textAlign: "center",
                        fontSize: 17,
                      }}
                    >
                      You gave {getPercMarks}% correct answer
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 10,
                        gap: 5,
                        borderRadius: 5,
                        backgroundColor: colors.WHITE,
                        elevation: 1,
                      }}
                    >
                      <View style={styles.resultTextContainer}>
                        <Text style={styles.resultText}>Q {totalQuestion}</Text>
                      </View>
                      <View style={styles.resultTextContainer}>
                        <Text style={styles.resultText}>✅ {correctAns} </Text>
                      </View>
                      <View style={styles.resultTextContainer}>
                        <Text style={styles.resultText}>
                          ❌ {totalQuestion - correctAns}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Button
                    text={"Back to Home"}
                    onPress={() => router.replace("/(tabs)")}
                  />
                  <Button text={"Attempt Again"} onPress={attemptAgain} />
                  <View style={{ marginTop: 25 }}>
                    <Text
                      style={{
                        fontFamily: "nunito-bold",
                        fontSize: 25,
                        color: colors.BLACK,
                        textAlign: "center",
                      }}
                    >
                      Summary
                    </Text>
                  </View>
                </View>
              ) : (
                <ActivityIndicator
                  size={"large"}
                  color={colors.BLACK}
                  style={{ top: "60%" }}
                />
              )}
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
        <View
          style={{ alignItems: "center", backgroundColor: colors.BACKGROUND }}
        ></View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  resultText: {
    fontFamily: "nunito",
    fontSize: 20,
  },
  resultTextContainer: {
    padding: 7,
  },
});
