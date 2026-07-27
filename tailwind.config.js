/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Every colour is a CSS variable defined in index.css, so light/dark swap
      // in one place and no component ever needs a `dark:` variant.
      colors: {
        page: 'var(--page)',
        surface: 'var(--surface)',
        raised: 'var(--raised)',
        subtle: 'var(--subtle)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        dim: 'var(--dim)',
        info: { DEFAULT: 'var(--info)', soft: 'var(--info-soft)', ink: 'var(--info-ink)' },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          soft: 'var(--accent-soft)',
          ink: 'var(--accent-ink)',
        },
        good: { DEFAULT: 'var(--good)', soft: 'var(--good-soft)', ink: 'var(--good-ink)' },
        warn: { DEFAULT: 'var(--warn)', soft: 'var(--warn-soft)', ink: 'var(--warn-ink)' },
        danger: { DEFAULT: 'var(--danger)', soft: 'var(--danger-soft)', ink: 'var(--danger-ink)' },
        violet: { DEFAULT: 'var(--violet)', soft: 'var(--violet-soft)', ink: 'var(--violet-ink)' },
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      // Card and panel silhouette: 14px corner radius.
      borderRadius: {
        lg: '10px',
        xl: '14px',
        '2xl': '18px',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-up': 'fade-up .22s ease-out both',
        shimmer: 'shimmer 1.4s infinite',
      },
    },
  },
  plugins: [],
}
