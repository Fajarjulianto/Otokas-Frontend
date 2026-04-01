/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        otokas: {
          primary: "#1E40AF", //blue-800
          secondary: "#F59E0B", //amber-500
          dark: "#0F172A", //slate-900
        },
      },
    },
  },
  plugins: [],
};
