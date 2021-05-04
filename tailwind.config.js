module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: "#ff4573",
        secondary: "#ff99b2",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
