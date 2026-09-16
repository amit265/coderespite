import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "../services/storage";
import appData from "../assets/data/appData.json";
import colors from "../constants/colors";
import { Emoji, EmojiText } from "../constants/constants";
import { userDetailsContext } from "../context/context";
import { CustomAlert } from "./shared/GlobalAlert";

export default function MoreApps() {
  const { gainXP } = useContext(userDetailsContext);

  const apps = appData.filter(app => {
    if (!app.show) return false;
    if (Platform.OS === 'ios' && !app.isAvailableOnIOS) return false;
    return true;
  });

  if (apps.length === 0) return null;

  const openApp = async (app) => {
    const url = Platform.OS === 'ios' ? app.iosUrl : app.androidUrl;
    if (url) {
      try {
        const appSlug = app.androidUrl.split('/').pop() || "app";
        const key = `ds_cross_promo_${appSlug}_clicked`;
        const alreadyClicked = await AsyncStorage.getItem(key);
        if (!alreadyClicked) {
          await AsyncStorage.setItem(key, "true");
          if (gainXP) {
            await gainXP(50);
            CustomAlert.alert(
              "Cross-Promotion Reward! 🎉",
              `Thank you for checking out "${app.name}"! You have been rewarded with +50 XP!`
            );
          }
        }
      } catch (err) {
        console.error("Failed to reward cross promotion XP:", err);
      }

      Linking.openURL(url).catch((err) =>
        console.error("Couldn't load page", err)
      );
    }
  };

  return (
    <View style={styles.container}>
      <EmojiText style={styles.title}>
        <Text style={styles.titleHighlight}>More by </Text>
        Destya Studio {Emoji.SPARKLES}
      </EmojiText>
      {apps.map((app, index) => (
        <TouchableOpacity
          key={index}
          style={styles.appCard}
          onPress={() => openApp(app)}
        >
          <Image source={{ uri: app.icon }} style={styles.appIcon} />
          <View style={styles.appInfo}>
            <Text style={styles.appName} numberOfLines={1}>
              {app.name}
            </Text>
            <Text style={styles.appDescription} numberOfLines={2}>
              {app.description}
            </Text>
          </View>
          <View style={styles.openButton}>
            <Text style={styles.openButtonText}>View</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: "100%",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "nunito-bold",
    marginBottom: 15,
    color: colors.BLACK,
    paddingHorizontal: 5,
  },
  appCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  appInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  appName: {
    fontSize: 15,
    fontFamily: "nunito-bold",
    color: colors.BLACK,
  },
  appDescription: {
    fontSize: 12,
    fontFamily: "nunito",
    color: "#6B7280",
    marginTop: 2,
  },
  openButton: {
    backgroundColor: colors.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  openButtonText: {
    color: colors.WHITE,
    fontSize: 12,
    fontFamily: "nunito-bold",
  },
});
