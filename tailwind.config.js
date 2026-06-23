/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2F7FB3",
        "primary-light": "#6FB6E0",
        ink: "#142433",
        mist: "#F2F8FC",
      },
    },
  },
  plugins: [],
};
