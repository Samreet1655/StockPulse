export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { paper: '#FAF8F4', card: '#FFFFFF', line: '#E7E2D8', navy: { 950: '#0B1B2E', 800: '#14304D', 600: '#3C5671', 400: '#7A8CA0' }, em: { 50: '#E8F5EF', 600: '#0E8A63', 700: '#0A6F4F' }, warn: '#B7791F', danger: '#B4343B' },
    fontFamily: { display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'], sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'] },
    boxShadow: { soft: '0 1px 2px rgba(11,27,46,.06), 0 4px 14px rgba(11,27,46,.05)' },
  } },
};
