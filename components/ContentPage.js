import React, { useRef, useState } from "react";
import { Animated, ScrollView, View, Text } from "react-native";
import Markdown from "react-native-markdown-display";
import { EmojiText } from "../constants/constants";

export default function ContentPage({ selectedLesson }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(1);
  const [scrollViewHeight, setScrollViewHeight] = useState(1);

  const safeScrollProgress =
  contentHeight > scrollViewHeight
    ? Animated.divide(scrollY, contentHeight - scrollViewHeight)
    : new Animated.Value(0);

  return (
    <View className="flex-1 rounded-lg relative">
      {/* 🔵 Scroll progress bar at top */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 4,
          width: safeScrollProgress.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "100%"],
            extrapolate: "clamp",
          }),
          backgroundColor: "#16a34a",
          zIndex: 10,
        }}
      />

<ScrollView
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(w, h) => setContentHeight(h)}
        onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <Markdown
          rules={{
            text: (node, children, parent, styles) => {
              return (
                <EmojiText key={node.key} style={styles.body}>
                  {node.content}
                </EmojiText>
              );
            },
          }}
          style={{
            body: {
              color: "#374151",
              fontSize: 14,
              lineHeight: 22,
              fontFamily: "nunito",
            },
            heading1: {
              color: "#16a34a",
              fontSize: 18,
              fontFamily: "nunito-bold",
            },
            heading2: {
              color: "#16a34a",
              fontSize: 16,
              fontFamily: "nunito-bold",
              marginTop: 10,
            },
            code_block: {
              backgroundColor: "#000000",
              color: "#16a34a", // Terminal green
              padding: 10,
              borderRadius: 6,
              fontFamily: "nunito",
            },
            fence: {
              backgroundColor: "#000000",
              color: "#16a34a",
              padding: 10,
              borderRadius: 6,
              fontFamily: "monospace",
            },
            code_inline: {
              backgroundColor: "#1a1a1a",
              color: "#16a34a",
              padding: 4,
              borderRadius: 4,
              fontFamily: "monospace",
            },
            bullet_list: { paddingLeft: 16 },
            list_item: {
              color: "#4b5563",
              marginBottom: 6,
              fontFamily: "nunito",
            },
          }}
        >
          {selectedLesson?.content}
        </Markdown>
      </ScrollView>
    </View>
  );
}
