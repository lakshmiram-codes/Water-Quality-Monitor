/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Trust/utility palette: deep slate-teal for the brand, amber/red
        // reserved strictly for water-safety signal states.
        ink: '#0F2A2E',
        deep: '#123B40',
        teal: '#1B6B70',
        aqua: '#4FB6BA',
        mist: '#EAF3F3',
        sand: '#F7F5EF',
        safe: '#2F8F5B',
        watch: '#D98A2B',
        danger: '#C1442D',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
