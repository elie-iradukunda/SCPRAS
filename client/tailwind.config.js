/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07111f',
        steel: '#102235',
        gold: '#f7b731',
        concrete: '#eef2f6',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 16px 40px rgba(7, 17, 31, 0.08)',
      },
    },
  },
  plugins: [],
};
