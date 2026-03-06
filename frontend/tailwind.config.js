/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all React component files
    "./public/index.html",        // Optional: if using custom HTML in public
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      colors: {
        red: {
          900: "#1a0000", // Custom dark red
        },
      },
      dropShadow: {
        redGlow: "0 0 15px #ff1a1a",
      },
      boxShadow: {
        redSoft: "0 0 25px rgba(255, 26, 26, 0.3)",
        redStrong: "0 0 25px #ff1a1a",
      },
    },
  },
  plugins: [],
};
