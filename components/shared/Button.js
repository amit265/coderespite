import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import colors from "../../constants/colors";

export default function Button({
  text,
  type = "fill",
  onPress,
  loading,
  disable = false,
  backgroundColor = colors.BUTTON,
  color= colors.WHITE
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disable}
      style={{
        padding: 15,
        width: "100%",
        borderRadius: 15,
        marginTop: 15,
        backgroundColor: type === "fill" ? backgroundColor : colors.WHITE,
      }}
    >
      {!loading ? (
        <Text
          style={{
            textAlign: "center",
            fontSize: 15,

            color: type === "fill" ? color : colors.PRIMARY,
            fontFamily: "nunito-bold",
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
