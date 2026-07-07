/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        wiki: {
          bg: "#f8f9fa",       // page background
          surface: "#ffffff",  // content surface
          text: "#202122",     // body text
          secondary: "#54595d",// secondary text
          muted: "#72777d",    // muted/tertiary text
          border: "#a2a9b1",   // borders & dividers
          "border-light": "#c8ccd1", // lighter borders
          blue: "#3366cc",     // primary link / accent
          "blue-hover": "#447ff5",
          "blue-visited": "#0b0080",
          "blue-light": "#eaf3ff", // blue tint bg
          green: "#00af89",    // positive / additions
          "green-bg": "#d5fdf4",
          red: "#d73333",      // negative / deletions
          "red-bg": "#fee7e6",
          header: "#ffffff",   // header bar
          "header-border": "#a7d7f9", // Wikipedia-style blue accent line
        },
      },
      fontFamily: {
        serif: ["'Linux Libertine'", "Georgia", "'Times New Roman'", "serif"],
        sans: ["'Helvetica Neue'", "Arial", "sans-serif"],
      },
      fontSize: {
        "wiki-base": ["14px", "1.6"],
        "wiki-sm": ["13px", "1.5"],
        "wiki-xs": ["12px", "1.4"],
      },
      borderRadius: {
        wiki: "2px",
      },
    },
  },
  plugins: [],
};
