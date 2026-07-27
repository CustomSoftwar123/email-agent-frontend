/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { colors: { brand: {
    50:'#eef4ff',100:'#d9e6ff',200:'#b9d0ff',500:'#3b6fed',600:'#2f5ad4',700:'#2848a8' } } } },
  plugins: [],
}
