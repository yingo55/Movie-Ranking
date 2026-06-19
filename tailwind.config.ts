import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#15181D',
        surface: '#1D2127',
        surface2: '#262B33',
        amber: '#E8A33D',
        teal: '#4F9D9D',
        cream: '#EDEAE3',
        muted: '#8B8F98',
        velvet: '#9C3B3B',
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'sans-serif'],
        serif: ['"Source Serif 4"', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
