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
      <Pressable onPress={() => setShowModal(true)} style={styles.content}>
        <View style={styles.avatarWrap}>
          <Image
            source={getAvatarImage(profile?.avatar)}
            style={styles.avatar}
          />
          <View style={styles.editBadge}>
            <Feather name="edit-3" size={14} color="white" />
          </View>
        </View>
        
        <Text style={styles.name}>{profile?.name || "user"}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{levelTitle}</Text>
        </View>
      </Pressable>
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 16,
    position: 'relative'
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#F3F4F6'
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'white'
  },
  name: {
    fontFamily: 'quicksand-bold',
    fontSize: 22,
    color: '#1F2937',
    marginBottom: 6,
  },
  levelBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDE9FE'
  },
  levelText: {
    fontFamily: 'nunito-bold',
    fontSize: 14,
    color: '#7C3AED',
  }
});
