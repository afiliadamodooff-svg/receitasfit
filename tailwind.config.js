/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fit: {
          green: "#1F9D55",
          dark: "#0B2A1D",
          cream: "#FFF8EE",
          orange: "#FF7A3D",
        },
      },
    },
  },
  plugins: [],
};
