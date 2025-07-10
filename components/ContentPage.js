import React, { useRef, useState } from "react";
import { Animated, ScrollView, View } from "react-native";
import Markdown from "react-native-markdown-display";

export default function ContentPage({ selectedLesson }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(1);
  const [scrollViewHeight, setScrollViewHeight] = useState(1);

  const safeScrollProgress =
  contentHeight > scrollViewHeight
    ? Animated.divide(scrollY, contentHeight - scrollViewHeight)
    : new Animated.Value(0);


  const lesson = {
    title: "What is JavaScript?",
    content: `# What is JavaScript?

JavaScript is a versatile, high-level programming language primarily used to add interactivity and logic to web pages. It runs on the client side in web browsers, allowing you to build dynamic user interfaces, handle events, validate forms, and more. JavaScript is **interpreted**, **loosely typed**, and **event-driven**.

## Why Learn JavaScript?

- Runs in all modern web browsers
- Essential for frontend development (alongside HTML & CSS)
- Powers major frameworks like React, Angular, and Vue
- Enables both frontend and backend (Node.js) development

## Basic Example

Let's start with a simple script that prints a greeting to the console:

\`\`\`javascript
// Basic greeting
console.log("Hello, JavaScript!");
\`\`\`

## Intermediate Example

Here's a function to check if a number is prime:

\`\`\`javascript
function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

console.log(isPrime(7)); // true
console.log(isPrime(10)); // false
\`\`\`

## Advanced Example

This example fetches data from an API and displays the result using async/await:

\`\`\`javascript
async function fetchUserData() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const users = await response.json();
    users.forEach(user => {
      console.log(\`\${user.name} - \${user.email}\`);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchUserData();
\`\`\`

JavaScript is the foundation of modern web apps, and mastering it opens the door to advanced technologies like React, Node.js, and beyond.
`,
  };

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
