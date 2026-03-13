import {
  AntDesign,
  Entypo,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
  Animated,
  Platform,
} from "react-native";
import PageTransition from "../../components/PageTransition";
import SafeScreen from "../../components/SafeScreen";
import colors from "../../constants/colors";
import { courseIcons } from "../../constants/constants";
import {
  adConfigContext,
  allCoursesContext,
  userDetailsContext,
} from "../../context/context";

// --- New Animated Quiz Card Component ---
const AnimatedQuizCard = ({ item, index, onPress, matchedAttempt }) => {
  // 1. Entrance Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // 2. Click Interaction Animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100, // Stagger effect
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96, // Slight shrink
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ margin: 12 }} // m-3
      >
        <Animated.View
          style={{
            borderRadius: 16,
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
            padding: 24, // p-6
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: scaleAnim }], // Bind scale animation
          }}
        >
          {/* Image Container */}
          <View
            style={{
              width: "100%",
              height: 200,
              borderRadius: 16,
              overflow: "hidden",
              marginBottom: 16,
              position: "relative",
            }}
          >
            <Image
              source={
                courseIcons[item.courseIcon] ||
                require("../../assets/default-icon.png")
              }
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
            {matchedAttempt && (
              <View
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: "rgba(255,255,255,0.8)", // Added background for better visibility
                }}
              >
                <MaterialCommunityIcons
                  name="checkbox-marked-circle"
                  size={24}
                  color={matchedAttempt?.score > 60 ? "#AAFF00" : "#FF0000"}
                />
              </View>
            )}
          </View>

          {/* Text Content */}
          <View style={{ width: "100%" }}>
            <Text
              style={{ fontSize: 18, fontFamily: "Nunito-Bold", color: "black" }}
              numberOfLines={2}
            >
              {item?.title}
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontFamily: "Nunito-SemiBold",
                color: "#6b7280",
                marginTop: 4,
              }}
            >
              Course: {item.courseTitle}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 12,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <AntDesign name="book" size={18} color="black" />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Nunito-SemiBold",
                    color: "#1f2937",
                  }}
                >
                  {item?.quiz?.length} Questions
                </Text>
              </View>

              {matchedAttempt && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <FontAwesome
                    name={matchedAttempt?.score > 60 ? "star" : "star-o"}
                    size={18}
                    color={matchedAttempt?.score > 60 ? "#AAFF00" : "#FF0000"}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Nunito-SemiBold",
                      color: "#1f2937",
                    }}
                  >
                    {matchedAttempt?.score}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export default function Quiz() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [selectCourse, setSelectCourse] = useState("All");

  const {
    allCourses = [],
    setSelectedCourse,
    selectedQuiz,
    setSelectedQuiz,
  } = useContext(allCoursesContext);
  const { setClickCount } = useContext(adConfigContext);
  const { userData } = useContext(userDetailsContext);

  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);

  useEffect(() => {
    const progress = userData?.progress;
    const allAttemptedQuizzes = Object.values(progress || {}).flatMap(
      (course) => course.attemptedQuizzes || []
    );
    setAttemptedQuizzes(allAttemptedQuizzes);
  }, [userData]);

  // ✅ Memoized list
  const filteredQuizzes = useMemo(() => {
    const quizzes = allCourses.flatMap((course) =>
      (course.quizzes || []).map((quiz) => ({
        ...quiz,
        courseId: course.id,
        courseTitle: course.title,
        courseIcon: course.icon,
        courseObject: course,
      }))
    );

    return quizzes.filter((quiz) => {
      const matchesSearch = quiz.title
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesCourse =
        selectCourse === "All" || quiz.courseTitle === selectCourse;
      return matchesSearch && matchesCourse;
    });
  }, [allCourses, searchText, selectCourse]);

  const handleQuizPress = (item) => {
    // Add small delay to let the user see the click animation
    setTimeout(() => {
      setSelectedCourse(item.courseObject);
      setClickCount((prev) => prev + 1);
      setSelectedQuiz(item);
      router.push(`/quiz/courses/${item?.id}`);
    }, 150);
  };

  const renderItem = ({ item, index }) => {
    const matchedAttempt = attemptedQuizzes.find(
      (quiz) => quiz.courseId === item.courseId && quiz.id === item.id
    );

    return (
      <AnimatedQuizCard
        item={item}
        index={index}
        onPress={() => handleQuizPress(item)}
        matchedAttempt={matchedAttempt}
      />
    );
  };

  return (
    <PageTransition>
      <SafeScreen>
        <Text className="text-2xl font-nunito-bold mb-4 text-black text-center py-2">
          Quiz
        </Text>

        <View className="flex-row items-center px-4 mb-4" style={{ gap: 10 }}>
          {/* Picker Container */}
          <View 
            className="bg-white rounded-xl border border-gray-300 overflow-hidden" 
            style={{ 
                flex: 1, 
                height: 50, 
                justifyContent: 'center',
                maxWidth: '40%' 
            }}
          >
            <Picker
              selectedValue={selectCourse}
              onValueChange={(value) => setSelectCourse(value)}
              style={{ 
                color: "#333", 
                fontFamily: "Nunito-Bold",
                height: Platform.OS === 'ios' ? 150 : 50,
                width: '100%',
              }}
              itemStyle={{ fontSize: 14, height: 150 }}
              dropdownIconColor="#666"
            >
              <Picker.Item
                label="All"
                value="All"
                style={{ color: "black", backgroundColor: colors.WHITE }}
              />
              {allCourses.map((course) => (
                <Picker.Item
                  key={course.id}
                  label={course.title}
                  value={course.title}
                  style={{ color: "black", backgroundColor: colors.WHITE }}
                />
              ))}
            </Picker>
          </View>

          {/* Search Box */}
          <View 
            className="relative rounded-xl border border-gray-300"
            style={{ flex: 2, height: 50 }}
          >
            <TextInput
              className="flex-1 bg-white rounded-xl font-nunito text-black w-full"
              placeholder="Search"
              placeholderTextColor={colors.GRAY}
              value={searchText}
              onChangeText={setSearchText}
              style={{ textAlign: "left", paddingLeft: 45, paddingRight: 40, height: '100%' }}
            />
            {searchText !== "" && (
              <Pressable
                className="absolute right-0 z-10 p-3 h-full flex items-center justify-center"
                onPress={() => setSearchText("")}
              >
                <Entypo name="cross" size={20} color="black" />
              </Pressable>
            )}
            <View className="absolute left-0 z-10 p-3 h-full flex items-center justify-center">
              <AntDesign name="search1" size={20} color="black" />
            </View>
          </View>
        </View>

        {filteredQuizzes.length === 0 ? (
          <Text className="text-center text-gray-500 font-nunito-bold mt-10">
            No quizzes available.
          </Text>
        ) : (
          <FlatList
            data={filteredQuizzes}
            keyExtractor={(item) => item.id.toString() + item.title}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </SafeScreen>
    </PageTransition>
  );
}
