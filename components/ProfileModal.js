import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState, useRef } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { availableImages, Emoji, EmojiText } from "../constants/constants";
import { userDetailsContext } from "../context/context";
import Button from "./shared/Button";

// --- Helper for Staggered Entrance ---
const FadeInView = ({ delay, children, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const ProfileModal = ({ setShowModal }) => {
  const [selectedImage, setSelectedImage] = useState(availableImages[0]);
  const { userData, updateUser } = useContext(userDetailsContext);
  const [error, setError] = useState("");
  const [username, setUsername] = useState(userData?.profile?.name || "");
  
  // Animation Refs
  const avatarScaleAnim = useRef(new Animated.Value(1)).current; // For the big avatar pop
  const shakeAnim = useRef(new Animated.Value(0)).current;       // For input error shake

  const router = useRouter();

  // Trigger "Pop" when selectedImage changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(avatarScaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(avatarScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
    ]).start();
  }, [selectedImage]);

  // Shake Animation Function
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleUsernameChange = (text) => {
    const trimmed = text.trim();
    if (trimmed.length > 15) {
      setError("Username can't be more than 15 characters.");
      triggerShake(); // Shake on limit
      return;
    }
    const regex = /^[a-zA-Z0-9_]*$/;
    if (!regex.test(trimmed)) {
      setError("Only letters, numbers, and underscores allowed.");
      triggerShake(); // Shake on bad char
    } else {
      setError("");
    }
    setUsername(trimmed);
  };

  const saveData = () => {
    if (!username || username === "user") {
      setError("Please enter a valid username");
      triggerShake();
      return;
    }

    if (error) {
        triggerShake();
        return;
    }

    Keyboard.dismiss(); // Hide keyboard nicely

    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];

    updateUser((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        avatar: selectedImage.name,
        name: username,
        createdAt: formattedDate,
        firstTime: false,
      },
    }));

    setShowModal(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ width: '100%' }}
    >
      <ScrollView 
        contentContainerStyle={{ alignItems: 'center' }} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mt-4 w-full">
          
          {/* 1. Title - First to appear */}
          <FadeInView delay={0} style={{ padding: 16, paddingBottom: 32 }}>
            <EmojiText className="text-xl font-nunito-bold text-center mb-6">
              Let’s set up your profile ✨
            </EmojiText>
          </FadeInView>

          {/* 2. Big Avatar - Second to appear */}
          <FadeInView delay={100} style={{ alignItems: 'center' }}>
            <Animated.Image
              source={selectedImage.source}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                marginBottom: 12,
                transform: [{ scale: avatarScaleAnim }], // Apply Pop Animation
              }}
            />
            <Text className="text-lg font-nunito mb-2">Select an Avatar:</Text>
          </FadeInView>

          {/* 3. Avatar List - Third to appear */}
          <FadeInView delay={200} style={{ height: 80 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 10 }}
            >
              {availableImages.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => setSelectedImage(img)}
                  style={{ marginHorizontal: 6 }}
                >
                  <Image
                    source={img.source}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 35,
                      borderWidth: selectedImage.name === img.name ? 3 : 0, // Thicker border for clarity
                      borderColor: selectedImage.name === img.name ? "#4F46E5" : "transparent",
                    }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </FadeInView>

          {/* 4. Input Field - Fourth to appear */}
          <FadeInView delay={300} style={{ width: '100%', marginTop: 30, marginBottom: 24 }}>
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                <Text className="text-base font-nunito mb-2">Username</Text>
                <TextInput
                value={username}
                onChangeText={handleUsernameChange}
                maxLength={15}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
                style={{
                    borderWidth: 1,
                    borderColor: error ? '#EF4444' : '#D1D5DB', // Red border on error
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    backgroundColor: 'white',
                    fontFamily: 'Nunito-Regular',
                    color: 'black'
                }}
                />
                {error ? (
                <Text className="text-red-500 text-sm mt-2 font-nunito">{error}</Text>
                ) : null}
            </Animated.View>
          </FadeInView>

          {/* 5. Save Button - Last to appear */}
          <FadeInView delay={400} style={{ width: '100%' }}>
            <Button text={"Continue"} onPress={saveData} />
          </FadeInView>
          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileModal;
