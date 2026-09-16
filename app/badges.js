import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "../components/SafeScreen";
import { BADGES, getUnlockedBadges } from "../services/badgeService";
import colors from "../constants/colors";

export default function BadgesScreen() {
  const router = useRouter();
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBadges = async () => {
      const unlocked = await getUnlockedBadges();
      setUnlockedIds(unlocked);
      setLoading(false);
    };
    loadBadges();
  }, []);

  const allBadges = Object.values(BADGES);
  
  // Group badges by category if desired, or just list them.
  // For simplicity, we'll list them all but sort by unlocked first.
  const sortedBadges = [...allBadges].sort((a, b) => {
    const aUnlocked = unlockedIds.includes(a.id);
    const bUnlocked = unlockedIds.includes(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  return (
    <SafeScreen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Badges & Achievements</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            You&apos;ve unlocked {unlockedIds.length} out of {allBadges.length} badges!
          </Text>
          
          <View style={styles.grid}>
            {sortedBadges.map((badge) => {
              const isUnlocked = unlockedIds.includes(badge.id);
              return (
                <View 
                  key={badge.id} 
                  style={[
                    styles.badgeCard, 
                    isUnlocked ? styles.unlockedCard : styles.lockedCard
                  ]}
                >
                  <Text style={[styles.emoji, !isUnlocked && styles.lockedEmoji]}>
                    {isUnlocked ? badge.emoji : "🔒"}
                  </Text>
                  <Text style={styles.badgeTitle} numberOfLines={1}>
                    {badge.title}
                  </Text>
                  <Text style={styles.badgeDesc} numberOfLines={2}>
                    {badge.desc}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 10,
    zIndex: 10,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontFamily: "quicksand-bold",
    color: colors.TEXT,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "nunito-semiBold",
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  badgeCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unlockedCard: {
    borderColor: "#4ADE80",
    borderWidth: 2,
  },
  lockedCard: {
    borderColor: "#E5E7EB",
    borderWidth: 1,
    opacity: 0.7,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  lockedEmoji: {
    opacity: 0.5,
  },
  badgeTitle: {
    fontSize: 14,
    fontFamily: "nunito-bold",
    color: colors.TEXT,
    textAlign: "center",
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 12,
    fontFamily: "nunito",
    color: "#6B7280",
    textAlign: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
