// tailwind.config.js
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        'short-lg': '(min-width: 900px) and (max-height: 560px)',
        'short': '(max-height: 560px)',
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Bodoni Moda", "Georgia", "serif"],
        antic: ["var(--font-antic)", "Didot", "Bodoni Moda", "serif"],
        sans: ["Inter", "system-ui", "Arial", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
};
