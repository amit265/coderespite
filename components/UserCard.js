import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { getAvatarImage, levels } from "../constants/constants";

export default function UserCard({ userData, setShowModal }) {
  const profile = userData?.profile;
  const levelTitle =
    levels[userData?.level?.currentLevel - 1]?.title || "Curious Kitten";

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View>
          <Image
            source={getAvatarImage(profile?.avatar)}
            style={styles.avatar}
          />
        </View>
        <View style={styles.info}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Username: </Text>
            <Text style={styles.value}>{profile?.name || "user"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Level: </Text>
            <Text style={styles.value}>{levelTitle}</Text>
          </View>
        </View>

        <Pressable
          style={styles.editButton}
          onPress={() => setShowModal(true)}
        >
          <Feather name="edit-3" size={24} color="black" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    // Android Shadow
    elevation: 3,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: "row",
    gap: 20,
    backgroundColor: "white",
    borderRadius: 12,
    position: 'relative'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  info: {
    justifyContent: "center",
    flex: 1,
  },
  infoRow: {
    flexDirection: "column",
    alignItems: "start",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontFamily: "nunito-bold",
    color: "#6b7280",
  },
  value: {
    fontSize: 16,
    fontFamily: "nunito",
    color: "#1f2937",
  },
  editButton: {
    position: "absolute",
    right: -10,
    top: -10,
    padding: 12,
  }
});
