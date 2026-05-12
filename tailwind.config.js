export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        night: "#050816",
        panel: "#0B1120",
        glass: "rgba(17,24,39,0.7)",
        violet: "#7C3AED",
        violetSoft: "#8B5CF6",
        cyan: "#06B6D4",
        slateText: "#94A3B8",
        muted: "#64748B",
      },
      boxShadow: {
        glow: "0 0 40px rgba(124, 58, 237, 0.25)",
        cyanGlow: "0 0 34px rgba(6, 182, 212, 0.22)",
      },
      backgroundImage: {
        "grid-glow":
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
