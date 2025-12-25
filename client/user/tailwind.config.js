/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,html}', // include your file types
  ],
  theme: {
    extend: {
      colors: {
        colorWhite: '#f2f2f2',
        colorBrown: '#ae9b84',
      },
    },
  },
  plugins: [],
}
