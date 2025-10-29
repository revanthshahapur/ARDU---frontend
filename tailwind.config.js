/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // 1. Define custom keyframes
      keyframes: {
        moveAuto: {
          '0%': { transform: 'translateX(110vw)' },
          '100%': { transform: 'translateX(-120vw)' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      // 2. Map keyframes to animation utilities
      animation: {
        'auto-move': 'moveAuto 15s linear infinite',
        'wheel-spin': 'spin 0.5s linear infinite',
      },
      // 3. Define custom spacing/sizing for wheels (optional, but helps match the look)
      spacing: {
        'wheel-w': '35px',
        'wheel-h': '37px',
        'hub-w': '10px',
        'hub-h': '11px',
      },
      borderWidth: {
        '5': '5px',
      },
      colors: {
        'road-dark': '#333',
        'wheel-rim': '#444',
        'wheel-bg': '#222',
        'hub-color': '#bbb',
      }
    },
  },
  plugins: [
    // 4. Plugin to handle the wheel's pseudo-element (`::after`) content
    require('tailwindcss-pseudo-elements')({
      customPseudoClasses: ['before', 'after'],
    }),
  ],
}