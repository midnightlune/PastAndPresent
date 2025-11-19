/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-200': '#beb3f7ff',
        'navy-300': '#a1a0e4ff',
        'navy-400': '#655ac7ff',
        'navy-500': '#343eb4ff',
        'navy-600': '#4556a8ff',
        'navy-700': '#2e338bff',
        'navy-800': '#1b3572ff',
        'navy-900': '#11174c',
        'brown': '#8e420cff',
        'scapegoat': '#eda428',
        'scapegoathead':'#f2b956ff',
        'shadow': '#397296',
        'amber': '#ef8f1a',
        'bluetext':'#39ddecff',
        'betterred':'#ff4c4cff',
        'darkred':'#cd0202ff',
        'glitter':'#f36513ff',
        'turquoise':'#22ea86ff',
        'bluetext-muted':'#2098a3ff',
      }
    },
  },
  plugins: [],
}
