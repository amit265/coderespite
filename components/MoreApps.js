import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { getMoreApps } from "../services/moreAppsService";
import colors from "../constants/colors";
import { Emoji } from "../constants/constants";

export default function MoreApps() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      const data = await getMoreApps();
      setApps(data);
      setLoading(false);
    };
    fetchApps();
  }, []);

  const openApp = (app) => {
    const url = Platform.OS === 'ios' ? app.iosUrl : app.androidUrl;
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Couldn't load page", err)
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.PRIMARY} />
      </View>
    );
  }

  if (apps.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Emoji>🚀</Emoji> More by Developer
      </Text>
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
