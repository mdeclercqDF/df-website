import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.html',
    './pages/**/*.html',
    './partials/**/*.html',
    './perspectives/**/*.html',
    './src/**/*.{js,html}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['PT Serif', ...defaultTheme.fontFamily.serif],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'df-body': '#444444',
        'df-dark': '#1c1c1c',
      },
      maxWidth: {
        content: '1242px',
      },
    },
  },
  plugins: [],
}
