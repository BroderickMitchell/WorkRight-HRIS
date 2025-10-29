import type { Config } from 'tailwindcss';
import { tailwindTheme } from '@workright/ui';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      ...tailwindTheme,
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  }
};

export default config;
