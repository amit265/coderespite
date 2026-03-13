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
} from "react-native";
import SafeScreen from "../components/SafeScreen";
import colors from "../constants/colors";
import { SHARE_MESSAGE, STORE_LINK } from "../constants/constants";
import { BannerAdComponent } from "../services/AdManager";

export default function Settings() {
  const router = useRouter();
  const handleContactUs = () => {

    const email = "mindcraftlearning97@gmail.com";
    const subject = "Support Request for CodeRespite";
    const body = "Hi, I need help with...";
    const url = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch((err) =>
      Alert.alert("Error", "Could not open email client.")
    );
  };

  const handleShare = async () => {
    try {
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

      <View
        style={{
          width: "90%",
          backgroundColor: "white",
          borderRadius: 60,
          padding: 20,
          height: "70%",
          marginTop: 50,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Number of Spins */}

        {/* Footer links */}
        <View
          style={{
            flexDirection: "column",
            justifyContent: "space-around",
            marginTop: 10,
            alignItems: "center",
            marginHorizontal: 20,
            paddingTop: 20,
            padding: 10,
            gap: 20,
          }}
        >
          <TouchableOpacity
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 20,
            }}
            onPress={handleShare}
          >
            <AntDesign name="sharealt" size={24} color="#000000" />
            <Text
              style={{
                color: "#000000",
                fontFamily: "nunito",
                fontSize: 18,
              }}
            >
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 20,
            }}
            onPress={handleContactUs}
          >
            <FontAwesome name="send" size={24} color="#000000" />
            <Text
              style={{
                color: "#000000",
                fontFamily: "nunito",
                fontSize: 18,
              }}
            >
              Contact Us
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 20,
            }}
            onPress={() =>
              Linking.openURL("https://mindcraftlearning.github.io/coderespite")
            }
          >
            <MaterialIcons name="privacy-tip" size={24} color="#000000" />
            <Text
              style={{
                color: "#000000",
                fontFamily: "nunito",
                fontSize: 18,
              }}
            >
              Privacy Policy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 20,
            }}
            onPress={() =>
              Linking.openURL(STORE_LINK)
            }
          >
            <MaterialIcons name="reviews" size={24} color="#000000" />
            <Text
              style={{
                color: "#000000",
                fontFamily: "nunito",
                fontSize: 18,
              }}
            >
              Rate and reviews
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Banner Ad */}
      <BannerAdComponent fixed={true} />
    </SafeScreen>
  );
}
