import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Linking,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "../../components/SafeScreen";
import PageTransition from "../../components/PageTransition";
import colors from "../../constants/colors";
import { getUserGroqApiKey, saveGroqApiKey } from "../../services/groqService";
import { CustomAlert } from "../../components/shared/GlobalAlert";

export default function AISetupGuide() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const loadKey = async () => {
      const savedKey = await getUserGroqApiKey();
      if (savedKey) setApiKey(savedKey);
    };
    loadKey();
  }, []);

  const handleSaveApiKey = async (text) => {
    setApiKey(text);
    await saveGroqApiKey(text);
  };

  const handleOpenConsole = () => {
    Linking.openURL("https://console.groq.com/keys").catch((err) =>
      CustomAlert.alert("Error", "Could not open Groq Console page.")
    );
  };

  return (
    <PageTransition>
      <SafeScreen>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={15} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>AI Configuration Guide</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Why section */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Ionicons name="help-circle" size={24} color="#8B5CF6" />
                <Text style={styles.sectionTitle}>Why configure your own API Key?</Text>
              </View>
              <Text style={styles.cardText}>
                {"CodeRespite leverages Groq's high-speed Llama models directly from your device. Since the app is free and does not require subscription fees:"}
              </Text>
              
              <View style={styles.bulletList}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>●</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldText}>100% Free & Unlimited:</Text> Groq offers a generous free tier for developers with high rate limits.
                  </Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>●</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldText}>Direct Execution:</Text> Bypasses middleman server queues, giving you instant responses.
                  </Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>●</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldText}>Local Privacy:</Text> {"Your key is stored securely on your device's local storage and is never uploaded."}
                  </Text>
                </View>
              </View>
            </View>

            {/* How section */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Ionicons name="flash" size={24} color="#F59E0B" />
                <Text style={styles.sectionTitle}>How to get a key in 1 minute</Text>
              </View>
              
              <View style={styles.stepContainer}>
                <View style={styles.stepRow}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>1</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Tap <Text style={styles.boldText}>Go to Groq Console</Text> below to open the key management page.
                  </Text>
                </View>

                <View style={styles.stepRow}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>2</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Sign up or log in using your Google or email account.
                  </Text>
                </View>

                <View style={styles.stepRow}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>3</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Press <Text style={styles.boldText}>Create API Key</Text>, give it a name (e.g. CodeRespite), and copy it.
                  </Text>
                </View>

                <View style={styles.stepRow}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>4</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Return here and paste your key into the API Key input field below.
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleOpenConsole}>
                <Text style={styles.primaryButtonText}>Go to Groq Console ↗</Text>
              </TouchableOpacity>
            </View>

            {/* API Key Configuration Card */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Ionicons name="key" size={24} color="#10B981" />
                <Text style={styles.sectionTitle}>Configure Custom API Key</Text>
              </View>
              <Text style={styles.cardText}>
                Provide your custom key below to override default server limits. Your changes are saved instantly:
              </Text>
              
              <View style={styles.inputWrapper}>
                <TextInput
                  secureTextEntry={!showKey}
                  placeholder="Paste your gsk_... key"
                  placeholderTextColor="#9CA3AF"
                  value={apiKey}
                  onChangeText={handleSaveApiKey}
                  style={styles.keyInput}
                />
                <TouchableOpacity onPress={() => setShowKey(!showKey)} hitSlop={15} style={styles.eyeIcon}>
                  <Ionicons name={showKey ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
              <Text style={styles.secondaryButtonText}>Done & Return</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeScreen>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontFamily: "quicksand-bold",
    marginLeft: 8,
    color: "#1F2937",
  },
  scrollContent: {
    paddingBottom: 60,
  },
  card: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "quicksand-bold",
    color: "#1F2937",
  },
  cardText: {
    fontSize: 15,
    fontFamily: "nunito",
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 16,
  },
  bulletList: {
    gap: 12,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bulletDot: {
    color: "#8B5CF6",
    fontSize: 12,
    marginRight: 8,
    marginTop: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "nunito",
    color: "#4B5563",
    lineHeight: 20,
  },
  boldText: {
    fontFamily: "nunito-bold",
    color: "#1F2937",
  },
  stepContainer: {
    gap: 16,
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 14,
    fontFamily: "quicksand-bold",
    color: "#D97706",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "nunito",
    color: "#4B5563",
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "quicksand-bold",
  },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryButtonText: {
    color: "#4B5563",
    fontSize: 16,
    fontFamily: "quicksand-bold",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  keyInput: {
    flex: 1,
    fontFamily: "nunito",
    fontSize: 14,
    color: "#1F2937",
    paddingVertical: 12,
  },
  eyeIcon: {
    padding: 8,
  },
});
