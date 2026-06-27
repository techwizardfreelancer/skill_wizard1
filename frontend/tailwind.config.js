module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        glass: 'rgba(255, 255, 255, 0.12)',
        'glass-border': 'rgba(255, 255, 255, 0.18)',
      },
      boxShadow: {
        glass: '0 24px 60px rgba(15, 23, 42, 0.16)',
      },
    },
  },
  plugins: [],
};
