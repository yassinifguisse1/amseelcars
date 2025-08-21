// tailwind.config.js
module.exports = {
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
      extend: {
        fontFamily: {
          playfair: ["var(--font-playfair)", "Bodoni Moda", "Georgia", "serif"],
          antic: ["var(--font-antic)", "Didot", "Bodoni Moda", "serif"],
          // optional body font pairing:
          sans: ["Inter", "system-ui", "Arial", "sans-serif"],
        },
      },
    },
  };