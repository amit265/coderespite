import React, { useState, useEffect, useRef, useContext } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Pressable,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import SafeScreen from "../../components/SafeScreen";
import PageTransition from "../../components/PageTransition";
import colors from "../../constants/colors";
import { getDueFlashcards, reviewFlashcard } from "../../services/srsService";
import { EmojiText } from "../../constants/constants";
import { userDetailsContext } from "../../context/context";

export default function SRSReviewScreen() {
  const router = useRouter();
  const { logActivity } = useContext(userDetailsContext);
  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width || 480, 480);

  const [loading, setLoading] = useState(true);
  const [dueCards, setDueCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Animated Flip values
  const animatedValue = useRef(new Animated.Value(0)).current;
  let value = 0;
  animatedValue.addListener(({ value: val }) => {
    value = val;
  });

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const loadDueCards = async () => {
    setLoading(true);
    try {
      const cards = await getDueFlashcards();
      setDueCards(cards || []);
      setCurrentIndex(0);
      setIsFlipped(false);
      animatedValue.setValue(0);
    } catch (err) {
      console.error("Error loading due cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDueCards();
  }, []);

  const flipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (isFlipped) {
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start(() => setIsFlipped(false));
    } else {
      Animated.spring(animatedValue, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start(() => setIsFlipped(true));
    }
  };

  const handleReview = async (gotItRight) => {
    const card = dueCards[currentIndex];
    if (!card) return;

    if (gotItRight) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }

    try {
      // Update Leitner intervals in service
      await reviewFlashcard(card.question, gotItRight);
      
      // If they forgot the card, add it to the end of the session queue!
      if (!gotItRight) {
        setDueCards((prev) => [...prev, card]);
      }

      if (logActivity) {
        await logActivity();
      }

      // Move to next card
      if (currentIndex + 1 < dueCards.length + (gotItRight ? 0 : 1)) {
        // If flipped, flip back to front instantly before moving
        if (isFlipped) {
          animatedValue.setValue(0);
          setIsFlipped(false);
        }
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Completed review deck! Reload cards list to see if box values updated
        await loadDueCards();
      }
    } catch (err) {
      console.error("Failed to save review:", err);
    }
  };

  if (loading) {
    return (
      <SafeScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading review queue... 🐾</Text>
        </View>
      </SafeScreen>
    );
  }

  // --- Empty / All Caught Up State ---
  if (dueCards.length === 0) {
    return (
      <PageTransition>
        <SafeScreen>
          <View style={styles.emptyContainer}>
            <EmojiText style={{ fontSize: 60, marginBottom: 20 }}>🎉</EmojiText>
            <Text style={styles.emptyTitle}>You&apos;re all caught up!</Text>
            <Text style={styles.emptySub}>
              No flashcards are currently due for review. Keep learning new courses to grow your spaced-repetition deck!
            </Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={() => router.replace("/(tabs)/flashcards")}>
              <Text style={styles.exploreBtnText}>Explore Flashcards</Text>
            </TouchableOpacity>
          </View>
        </SafeScreen>
      </PageTransition>
    );
  }

  const currentCard = dueCards[currentIndex];

  return (
    <PageTransition>
      <SafeScreen>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={15} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={28} color="black" />
            </Pressable>
            <Text style={styles.headerTitle}>🧠 Spaced Recall</Text>
            <Text style={styles.headerCount}>{currentIndex + 1}/{dueCards.length}</Text>
          </View>

          <View style={styles.cardContainer}>
            {/* Interactive Flip Card */}
            <Pressable onPress={flipCard} style={{ width: screenWidth * 0.8, height: 260 }}>
              {/* Front Side */}
              <Animated.View
                style={[
                  styles.flipCard,
                  styles.flipCardFront,
                  {
                    transform: [{ rotateY: frontInterpolate }],
                    opacity: frontOpacity,
                  },
                ]}
              >
                {currentCard?.moduleTitle && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{currentCard.moduleTitle}</Text>
                  </View>
                )}
                <Text style={styles.questionText}>{currentCard?.question}</Text>
                <Text style={styles.tapPrompt}>Tap to flip 🐾</Text>
              </Animated.View>

              {/* Back Side */}
              <Animated.View
                style={[
                  styles.flipCard,
                  styles.flipCardBack,
                  {
                    transform: [{ rotateY: backInterpolate }],
                    opacity: backOpacity,
                  },
                ]}
              >
                <Text style={styles.answerText}>{currentCard?.answer}</Text>
                <Text style={styles.tapPrompt}>Tap to see question</Text>
              </Animated.View>
            </Pressable>
          </View>

          {/* Feedback Action Buttons (Only visible when answer is revealed) */}
          {isFlipped ? (
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.btn, styles.btnRed]} onPress={() => handleReview(false)}>
                <Ionicons name="close-circle" size={22} color="white" />
                <Text style={styles.btnText}>Forgot 👎</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={() => handleReview(true)}>
                <Ionicons name="checkmark-circle" size={22} color="white" />
                <Text style={styles.btnText}>Got It! 👍</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyActionRow}>
              <Text style={styles.instructionText}>Think of the answer first, then tap the card to check!</Text>
            </View>
          )}
        </View>
      </SafeScreen>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontFamily: "nunito-semiBold",
    fontSize: 15,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "quicksand-bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "nunito",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  exploreBtnText: {
    color: "white",
    fontSize: 15,
    fontFamily: "quicksand-bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "white",
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "nunito-bold",
    color: "black",
  },
  headerCount: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#6B7280",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  flipCard: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  flipCardFront: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  flipCardBack: {
    backgroundColor: colors.PRIMARY,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  badge: {
    position: "absolute",
    top: 16,
    backgroundColor: "#F3E8FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "nunito-bold",
    color: "#8B5CF6",
  },
  questionText: {
    fontSize: 20,
    fontFamily: "nunito-bold",
    textAlign: "center",
    color: "#1F2937",
    lineHeight: 28,
  },
  answerText: {
    fontSize: 18,
    fontFamily: "nunito-bold",
    textAlign: "center",
    color: "white",
    lineHeight: 26,
  },
  tapPrompt: {
    position: "absolute",
    bottom: 16,
    fontSize: 12,
    fontFamily: "nunito",
    color: "#9CA3AF",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  emptyActionRow: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 50,
  },
  instructionText: {
    fontSize: 13,
    fontFamily: "nunito",
    color: "#9CA3AF",
    textAlign: "center",
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  btnRed: {
    backgroundColor: "#EF4444",
  },
  btnGreen: {
    backgroundColor: "#10B981",
  },
  btnText: {
    color: "white",
    fontSize: 15,
    fontFamily: "quicksand-bold",
  },
});
