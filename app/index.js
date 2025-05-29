import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import LottieView from "lottie-react-native";
import React, { useContext, useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import SafeScreen from "../components/SafeScreen";
import Button from "../components/shared/Button";
import SplashScreenComponent from "../components/SplashScreenComponent";
import {
  adConfigContext,
  allCoursesContext,
  userDetailsContext,
} from "../context/context";
import { db } from "../services/firebaseConfig";
import { getAllCoursesWithSubcollections } from "../services/getAllCoursesWithSubcollections";

const { width, height } = Dimensions.get("window");
export default function Index() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const { setAdConfig } = useContext(adConfigContext);
  const [loading, setLoading] = useState(true);
  const { setAllCourses, update } = useContext(allCoursesContext);
  const { userData, updateUser } = useContext(userDetailsContext);

  const loadData = async () => {
    try {
      await AsyncStorage.setItem("@user_data", JSON.stringify(userData));
      const storedUser = await AsyncStorage.getItem("@user_data");
      if (storedUser) {
        updateUser(JSON.parse(storedUser));
      }
      const storedCourses = await AsyncStorage.getItem("@allCourses_data");

      if (storedCourses) {
        setAllCourses(JSON.parse(storedCourses));
      } else {
        const freshData = await getAllCoursesWithSubcollections();
        setAllCourses(freshData); // update context
        await AsyncStorage.setItem(
          "@allCourses_data",
          JSON.stringify(freshData)
        ); // cache for future
      }
    } catch (error) {
      console.error("❌ Error loading AsyncStorage: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      await loadData();
    };
    fetch();
  }, [update]);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading fonts/assets
        loadData();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // ✅ Hide the native splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();

    // Show custom splash screen for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let unsubscribe;

    const fetchAdSettings = () => {
      try {
        unsubscribe = onSnapshot(
          doc(db, "config", "adSettings"),
          (doc) => {
            if (doc.exists()) {
              setAdConfig(doc.data());
            }
          },
          (error) => {
            console.log("Error fetching ad settings:", error);
          }
        );
      } catch (error) {
        console.log("Error setting up snapshot:", error);
      }
    };

    fetchAdSettings();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (showSplash) {
    return <SplashScreenComponent />;
  }


  return (
    <SafeScreen>
      <View className="h-2/3">
        <View className="flex-1 flex-col gap-10">
          <Image source={require("../assets/images/visual-picture.png")} />

          {!loading && (
            <View
              style={{
                position: "absolute",
                top: height / 2 + 250, // Half of screen - half of Lottie height
                left: width / 2 - 175, // Half of screen - half of Lottie width
              }}
            >
              <LottieView
                source={require("../assets/paw.json")}
                autoPlay
                loop
                style={{
                  height: 150,
                  width: 160,
                  transform: [{ rotate: "45deg" }],
                }}
              />
            </View>
          )}
        </View>
      </View>
      <View className="flex flex-col h-1/3 -mt-12">
        <Text className="text-black text-2xl font-quicksand-bold text-center mt-2">
          Welcome to CodeRespite!
        </Text>
        <Text className="text-gray-800 text-base font-quicksand text-center mt-2 mx-8">
          Learn to code with your favorite Meowgrammer! 🐾
        </Text>

        {!loading && (
          <View className="rounded-lg mx-auto flex flex-col justify-center items-center -mt-14">
            <LottieView
              source={require("../assets/cat.json")}
              autoPlay
              loop
              style={{
                height: 100,
                width: 100,
                backgroundColor: "Red",
                marginBottom: -15,
              }}
            />

            <Button
              text={"Let's Start!"}
              onPress={() => {
                router.replace("(tabs)");
              }}
            />
          </View>
        )}
      </View>
      {loading && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
            backgroundColor: "rgba(0, 0, 0, 0.2)",

            top: -50,
            left: -50,
            right: -50,
          }}
        >
          <LottieView
            source={require("../assets/loading.json")}
            autoPlay
            loop
            style={{
              height: 200,
              width: 200,
            }}
          />
        </View>
      )}
    </SafeScreen>
  );
}
