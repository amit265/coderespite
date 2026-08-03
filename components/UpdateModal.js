import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform, Linking } from "react-native";
import colors from "../constants/colors";

export default function UpdateModal({ visible, changelog, remoteVersion, onClose }) {
  const handleUpdate = () => {
    const storeLink = "https://destyastudio.com/products/code-respite";
    Linking.openURL(storeLink).catch((err) =>
      console.error("Failed to open store link:", err)
    );
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>New Update Available! 🚀</Text>
          <Text style={styles.versionText}>Version {remoteVersion} is now ready for download.</Text>
          
          <Text style={styles.sectionTitle}>{"What's New:"}</Text>
          <ScrollView style={styles.changelogScroll} showsVerticalScrollIndicator={false}>
            {changelog.map((item, index) => (
              <View key={index} style={styles.bulletRow}>
                <Text style={styles.bulletPoint}>●</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.updateButtonText}>Update Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
    ...(Platform.OS === "web" && {
      maxWidth: 480,
    }),
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#0C1D59",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#132F94",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "nunito-bold",
  },
  versionText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "nunito",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFA500", // Accent Neon Amber
    alignSelf: "flex-start",
    marginBottom: 8,
    fontFamily: "nunito-bold",
  },
  changelogScroll: {
    maxHeight: 150,
    width: "100%",
    marginBottom: 20,
    backgroundColor: "rgba(19, 47, 148, 0.3)", // Sub-indigo background
    borderRadius: 12,
    padding: 12,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 8,
    color: "#FFA500",
    marginRight: 8,
    marginTop: 5,
  },
  bulletText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    flex: 1,
    lineHeight: 18,
    fontFamily: "nunito",
  },
  updateButton: {
    width: "100%",
    backgroundColor: "#FFA500",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  updateButtonText: {
    color: "#0C1D59",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "nunito-bold",
  },
  closeButton: {
    paddingVertical: 8,
  },
  closeButtonText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
    fontFamily: "nunito",
  },
});
