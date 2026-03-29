import { useRouter } from "expo-router";
import { useContext, useEffect, useRef } from "react";
import { Image, Text, View, Animated, Pressable } from "react-native";
import PageTransition from "../../components/PageTransition";
import SafeScreen from "../../components/SafeScreen";
import RefreshWrapper from "../../components/shared/RefreshWrapper";
import { flashcardIcons } from "../../constants/constants";
import { adConfigContext, allCoursesContext, userDetailsContext } from "../../context/context";
import { useGlobalRefresh } from "../../hooks/useGlobalRefresh";

// --- Animated Card Component ---
const AnimatedCard = ({ item, index, onPress }) => {
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
        delay: index * 100, // Stagger effect
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  // Handlers for the "Click" animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92, // Shrinks to 92% size
      useNativeDriver: true,
      speed: 20,     // Fast response
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,    // Bounces back to 100%
      friction: 4,   // Low friction = extra bouncy
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }], // Controls the entrance slide
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ marginBottom: 24 }} // Move margin here for layout consistency
      >
        <Animated.View
          style={{
            width: 160,
            height: 160,
            borderRadius: 24,
            overflow: "hidden",
            position: "relative",
            transform: [{ scale: scaleAnim }], // Controls the click scale
          }}
        >
          <Image
            source={
              flashcardIcons[item?.icon] || require("../../assets/default-icon.png")
            }
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "cover",
              borderRadius: 20,
            }}
          />
          {/* Overlay */}
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              padding: 16, // p-4
              backgroundColor: "rgba(0, 0, 0, 0.4)", // Darker overlay for better text contrast
              borderRadius: 20,
              justifyContent: "flex-end", // Align text to bottom looks cleaner
            }}
          >
            <Text 
              style={{ 
                color: "white", 
                fontSize: 18, 
                fontWeight: "700", // Bold
                fontFamily: "Nunito-Bold" // Ensure font matches your system
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

export default function FlashCards() {
  const router = useRouter();
  const { allCourses, setSelectedCourse } = useContext(allCoursesContext);
  const { setClickCount } = useContext(adConfigContext);
  const { updateCourse } = useContext(userDetailsContext);
  const { refreshData, globalRefreshing } = useGlobalRefresh();

  const handleCardPress = (item) => {
    // We add a tiny delay to allow the "bounce" animation to be seen before navigating
    setTimeout(() => {
        setSelectedCourse(item);
        updateCourse(item?.title, {});
        setClickCount((prev) => prev + 1);
        router.push(`/flashcards/courses/${item?.id}`);
    }, 150);
  };

  return (
    <PageTransition>
      <SafeScreen>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 16 }}>
          FlashCards
        </Text>

        <RefreshWrapper
          onRefresh={refreshData}
          refreshing={globalRefreshing}
        >
          {allCourses?.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-gray-500 font-nunito-bold">Pull down to load flashcards</Text>
            </View>
          ) : (
            <View 
              style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                justifyContent: 'space-evenly',
                paddingTop: 10
              }}
            >
              {allCourses.map((item, index) => (
                <AnimatedCard
                  key={item.id}
                  item={item}
                  index={index}
                  onPress={() => handleCardPress(item)}
                />
              ))}
            </View>
          )}
        </RefreshWrapper>
      </SafeScreen>
    </PageTransition>
  );
}
