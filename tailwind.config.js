/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./components/home.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito-Regular"],
        "nunito-semibold": ["Nunito-Semibold"],
        "nunito-bold": ["Nunito-Bold"],
        quicksand: ["Quicksand-Regular"],
        "quicksand-semibold": ["Quicksand-Semibold"],
        "quicksand-bold": ["Quicksand-Bold"],
      },
    },
  },
  plugins: [],
};
