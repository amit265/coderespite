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
        nunito: ["nunito"],
        "nunito-semibold": ["nunito-semibold"],
        "nunito-bold": ["nunito-bold"],
        quicksand: ["quicksand"],
        "quicksand-semibold": ["quicksand-semibold"],
        "quicksand-bold": ["quicksand-bold"],
      },
    },
  },
  plugins: [],
};
