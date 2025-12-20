const { getDefaultConfig } = require("expo/metro-config"); // ✅ Correct way
const { withNativeWind } = require("nativewind/metro");

// Extend Expo's default config
const config = getDefaultConfig(__dirname);

// Pass it through NativeWind's config enhancer
module.exports = withNativeWind(config, {
  input: "./app/global.css", // Adjust path if needed
});
