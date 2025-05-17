import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import colors from "../../constants/colors";
export default function Header() {
  const router = useRouter();

  return (
    <View
      style={{
        display: "flex",

        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%",
        paddingBottom: 20,
        borderBottomWidth: 1,
      }}
    >
      <View>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <Text
            style={{
              fontFamily: "Baloo2",
              fontSize: 20,
              color: colors.ERROR,
              fontWeight: 800,
            }}
          >
            CODE
          </Text>
          <Text
            style={{
              fontFamily: "Baloo2",
              fontSize: 20,
              color: colors.TEXT,
              fontWeight: 800,
            }}
          >
            RESPITE
          </Text>
        </View>
        <View>
          <Text
            style={{
              fontSize: 10,
              color: colors.TEXT,
            }}
          >
            REFRESH YOUR TECH SKILLS
          </Text>
        </View>
      </View>
      <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        {/* <TouchableOpacity onPress={() => router.push("/favorites")}>
          <Ionicons name="heart" size={36} color="black" />
        </TouchableOpacity> */}
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <Ionicons name="settings-outline" size={36} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
