import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Linking,
  Pressable,
  Share,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
} from "react-native";
import SafeScreen from "../components/SafeScreen";
import MoreApps from "../components/MoreApps";
import colors from "../constants/colors";
import { SHARE_MESSAGE, STORE_LINK } from "../constants/constants";
import { BannerAdComponent } from "../services/AdManager";

export default function Settings() {
  const router = useRouter();
  const handleContactUs = () => {
    Linking.openURL("https://destyastudio.com/products/code-respite/support").catch((err) =>
      Alert.alert("Error", "Could not open support page.")
    );
  };

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(SHARE_MESSAGE);
          Alert.alert("Link Copied! 📋", "The share message has been copied to your clipboard!");
        } else {
          Alert.alert("Share CodeRespite", SHARE_MESSAGE);
        }
        return;
      }

      const result = await Share.share({
        message: SHARE_MESSAGE,
      });

      if (result.action === Share.sharedAction) {
        // console.log("App shared!");
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed.");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <SafeScreen>
      <View className="relative w-full items-center justify-center">
        {/* Back Arrow - Positioned on the left */}
        <Pressable
          onPress={() => router.back()}
          className="absolute justify-center items-center left-4"
        >
          <Ionicons name="arrow-back" size={30} color="black" />
        </Pressable>

        {/* Title - Centered */}
        <Text
          style={{
            fontSize: 25,
            fontFamily: "quicksand-bold",
            color: colors.TEXT,
            textAlign: "center",
          }}
        >
          Settings
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View
          style={{
            width: "90%",
            backgroundColor: "white",
            borderRadius: 40,
            padding: 20,
            marginTop: 30,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {/* Footer links */}
          <View
            style={{
              flexDirection: "column",
              justifyContent: "space-around",
              marginTop: 10,
              alignItems: "center",
              marginHorizontal: 10,
              padding: 10,
              gap: 20,
            }}
          >
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleShare}
            >
              <AntDesign name="sharealt" size={24} color="#000000" />
              <Text style={styles.settingText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleContactUs}
            >
              <FontAwesome name="send" size={24} color="#000000" />
              <Text style={styles.settingText}>Contact Us</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                Linking.openURL("https://destyastudio.com/products/code-respite/privacy")
              }
            >
              <MaterialIcons name="privacy-tip" size={24} color="#000000" />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                Linking.openURL(STORE_LINK)
              }
            >
              <MaterialIcons name="reviews" size={24} color="#000000" />
              <Text style={styles.settingText}>Rate and reviews</Text>
            </TouchableOpacity>

            {/* More Apps Section */}
            <MoreApps />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Banner Ad */}
      <BannerAdComponent fixed={true} />
    </SafeScreen>
  );
}

const styles = {
  settingItem: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 20,
  },
  settingText: {
    color: "#000000",
    fontFamily: "nunito",
    fontSize: 18,
  }
};
