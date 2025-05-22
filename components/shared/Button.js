import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import colors from "../../constants/colors";

export default function Button({
  text,
  type = "fill",
  onPress,
  loading,
  disable = false,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disable}
      style={{
        padding: 15,
        width: "100%",
        borderRadius: 15,
        borderWidth: 1,
        borderColor: colors.PRIMARY,
        marginTop: 15,
        backgroundColor: type === "fill" ? colors.BUTTON : colors.WHITE,
      }}
    >
      {!loading ? (
        <Text
          style={{
            textAlign: "center",
            fontSize: 15,

            color: type === "fill" ? "black" : colors.PRIMARY,
            fontFamily: "nunito",
          }}
        >
          {text}
        </Text>
      ) : (
        <ActivityIndicator
          size={"large"}
          color={type === "fill" ? colors.WHITE : colors.PRIMARY}
        />
      )}
    </TouchableOpacity>
  );
}
