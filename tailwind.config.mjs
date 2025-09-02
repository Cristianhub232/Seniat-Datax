/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--mb-color-brand)',
      },
    },
  },
  plugins: [],
}
