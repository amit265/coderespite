import React, { useEffect, useRef } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Share,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";
import { EmojiText, STORE_LINK } from "../constants/constants";
import { CustomAlert } from "./shared/GlobalAlert";

export default function BadgeModal({ visible, onClose, badge }) {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.3);
      rotateAnim.setValue(0);
    }
  }, [visible]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleShare = async () => {
    if (!badge) return;
    try {
      const storeLink = STORE_LINK;
      const shareMessage = `${badge.message}\n\nLearn to code with CodeRespite! 🐾\n${storeLink}`;
      if (Platform.OS === 'web') {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareMessage);
          CustomAlert.alert("Achievement Copied! 📋", "Your coding achievement message is copied to clipboard!");
        } else {
          CustomAlert.alert("My Coding Achievement", shareMessage);
        }
        return;
      }
      await Share.share({
        message: shareMessage,
      });
    } catch (error) {
      console.error("Share achievement error:", error);
    }
  };

  if (!badge) return null;

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {/* Confetti / Ray Background effect */}
          <Animated.View style={[styles.rayContainer, { transform: [{ rotate: spin }] }]}>
            <Ionicons name="sunny" size={160} color="rgba(255, 165, 0, 0.15)" />
          </Animated.View>

          <View style={styles.emojiContainer}>
            <EmojiText style={{ fontSize: 72 }}>{badge.emoji}</EmojiText>
          </View>

          <Text style={styles.title}>New Achievement!</Text>
          <Text style={styles.badgeTitle}>{badge.title}</Text>
          <Text style={styles.desc}>{badge.desc}</Text>

          <View style={styles.statusRow}>
            <Ionicons name="trophy" size={18} color="#D97706" />
            <Text style={styles.statusText}>Credential Unlocked</Text>
          </View>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="logo-linkedin" size={20} color="white" />
            <Text style={styles.shareBtnText}>Share Achievement 🚀</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Continue 🐾</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "85%",
    maxWidth: 360,
    backgroundColor: "#0C1D59",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  rayContainer: {
    position: "absolute",
    top: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    zIndex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    fontSize: 14,
    fontFamily: "nunito-bold",
    color: "#FFA500",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
    zIndex: 1,
  },
  badgeTitle: {
    fontSize: 22,
    fontFamily: "quicksand-bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
    zIndex: 1,
  },
  desc: {
    fontSize: 14,
    fontFamily: "nunito",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 12,
    zIndex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
    zIndex: 1,
  },
  statusText: {
    fontSize: 13,
    fontFamily: "quicksand-bold",
    color: "#D97706",
  },
  shareBtn: {
    width: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    zIndex: 1,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  shareBtnText: {
    color: "white",
    fontSize: 15,
    fontFamily: "quicksand-bold",
  },
  closeBtn: {
    paddingVertical: 8,
    zIndex: 1,
  },
  closeBtnText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
    fontFamily: "nunito-bold",
  },
});
