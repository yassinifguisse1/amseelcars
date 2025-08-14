// tailwind.config.js
module.exports = {
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
      extend: {
        fontFamily: {
          heading: ["var(--font-playfair)", "serif"],
          // keep your normal text on Geist:
          sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
          mono: ["var(--font-geist-mono)", "monospace"],
        },
      },
    },
  };