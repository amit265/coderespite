import { useRouter } from "expo-router";
import { useContext, useEffect, useRef } from "react";
import { FlatList, Image, Text, View, Animated, Pressable } from "react-native";
import PageTransition from "../../components/PageTransition";
import SafeScreen from "../../components/SafeScreen";
import { courseIcons } from "../../constants/constants";
import { adConfigContext, allCoursesContext } from "../../context/context";

// --- New Animated Card Component ---
const AnimatedLearnCard = ({ item, index, onPress }) => {
  // 1. Entrance Animations (Slide Up & Fade In)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // 2. Interaction Animation (Scale on Press)
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Run entrance animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100, // Stagger effect: multiplied by index
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

  // Handlers for the "Click" animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95, // Shrinks slightly
      useNativeDriver: true,
      speed: 20,     // Fast response
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,    // Bounces back to 100%
      friction: 4,   // Low friction = nice bouncy feel
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }], // Controls entrance slide
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ marginBottom: 24 }}
      >
        <Animated.View
          style={{
            width: 160,
            height: 160,
            borderRadius: 24, // Increased radius for a modern look
            overflow: "hidden",
            position: "relative",
            transform: [{ scale: scaleAnim }], // Controls click scale
            // Add subtle shadow
            backgroundColor: 'white',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Image
            source={
              courseIcons[item?.icon] || require("../../assets/default-icon.png")
            }
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "cover",
            }}
          />
          {/* Overlay - Aligned to bottom for consistency with Flashcards */}
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              padding: 16,
              backgroundColor: "rgba(0, 0, 0, 0.4)", // Darker overlay for contrast
              justifyContent: "flex-end",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontFamily: "Nunito-Bold",
              }}
            >
              {item.title}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export default function Learn() {
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);
  const { allCourses, setSelectedCourse, setUpdate } =
    useContext(allCoursesContext);

  useEffect(() => {
    if (allCourses?.length === 0) {
      setUpdate((prev) => !prev);
    }
  }, [allCourses]);

  const handleCardPress = (item) => {
    // Add delay so user sees the bounce animation
    setTimeout(() => {
      setClickCount((prev) => prev + 1);
      setSelectedCourse(item);
      router.push(`/learn/courses/${item?.id}`);
    }, 150);
  };

  const renderModuleItem = ({ item, index }) => (
    <AnimatedLearnCard
      item={item}
      index={index}
      onPress={() => handleCardPress(item)}
    />
  );

  return (
    <PageTransition>
      <SafeScreen>
        <Text className="text-2xl font-nunito-bold mb-4 text-black text-center py-2">
          Courses
        </Text>

        <FlatList
          data={allCourses}
          renderItem={renderModuleItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-evenly" }}
          // Important: Add padding at bottom so last items don't hide behind tab bar
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </SafeScreen>
    </PageTransition>
  );
}