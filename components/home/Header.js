import { Entypo, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../../constants/colors";

export default function Header() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [blink, setBlink] = useState(false);

  // Function to handle blinking effect

  const handleBlink = () => {
    setBlink((prev) => !prev);
  };

  // funciton to handle blinking effect, it will blibk every second
  useEffect(() => {
    const interval = setInterval(() => {
      handleBlink();
    }, 1000); // Blink every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          "Check out this amazing app on the Play Store!\n\nhttps://play.google.com/store/apps/details?id=com.mindcraftlearning.coderespite",
      });

      if (result.action === Share.sharedAction) {
        console.log("App shared!");
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed.");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <View
      className="flex-row justify-between items-center border-b border-gray-400 px-4 pb-4 relative"
    >
      <View className="flex-1 items-center justify-center">
        <View className="flex-row items-center">
          <Text
            className="text-2xl"
            style={{ fontFamily: "quicksand-bold", color: colors.PRIMARY }}
          >
            {"<"}
          </Text>
          <Text
            className="text-2xl"
            style={{ fontFamily: "quicksand-bold", color: colors.ERROR }}
          >
            CODE
          </Text>
          <Text
            className="text-2xl"
            style={{ fontFamily: "quicksand-bold", color: colors.TEXT }}
          >
            RESPITE
          </Text>
          <Text
            className="text-2xl"
            style={{
              fontFamily: "quicksand-bold",
              color: blink ? colors.ERROR : "transparent",
            }}
          >
            /
          </Text>
          <Text
            className="text-2xl"
            style={{ fontFamily: "quicksand-bold", color: colors.PRIMARY }}
          >
            {">"}
          </Text>
        </View>
        <Text
          className="text-sm text-center mt-1"
          style={{ color: colors.TEXT, fontFamily: "quicksand-bold" }}
        >
          REFRESH YOUR TECH SKILLS
        </Text>
      </View>

      {!menuVisible && (
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50"
        >
          <Entypo name="dots-three-vertical" size={24} color="black" />
        </TouchableOpacity>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View className="flex-1">
          {/* Top-right toggle button inside Modal */}
          <TouchableOpacity
            onPress={() => setMenuVisible(false)}
            className="absolute right-6 top-9 z-50"
          >
            <Entypo name="cross" size={30} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 p-4 justify-start pt-20 items-end"
            activeOpacity={1}
            onPressOut={() => setMenuVisible(false)}
          >
            <View
              className="py-4 px-6 rounded-2xl shadow-lg border border-gray-300"
              style={{ backgroundColor: colors.BACKGROUND }}
            >
              {[
                {
                  label: "Profile",
                  icon: "user",
                  action: () => router.push("(tabs)/profile"),
                },
                {
                  label: "Share",
                  icon: "share",
                  action: handleShare,
                },
                {
                  label: "Review",
                  icon: "star",
                  action: () =>
                    Linking.openURL(
                      "https://play.google.com/store/apps/details?id=com.mindcraftlearning.coderespite"
                    ),
                },
                {
                  label: "Settings",
                  icon: "settings",
                  action: () => router.push("/settings"),
                },
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setMenuVisible(false);
                    item.action();
                  }}
                  className="flex-row items-center py-3 border-b border-gray-200"
                >
                  <Feather
                    name={item.icon}
                    size={20}
                    color="black"
                    className="mr-3"
                  />
                  <Text className="text-lg font-semibold">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
