/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#FFF8E1',
                    100: '#FFECB3',
                    200: '#FFE082',
                    300: '#FFD54F',
                    400: '#FFCA28',
                    500: '#FFC107',
                    600: '#FFB300',
                    700: '#FFA000',
                    800: '#FF8F00',
                    900: '#FF6F00',
                },
                accent: {
                    50: '#EFEBE9',
                    100: '#D7CCC8',
                    200: '#BCAAA4',
                    300: '#A1887F',
                    400: '#8D6E63',
                    500: '#795548',
                    600: '#6D4C41',
                    700: '#5D4037',
                    800: '#4E342E',
                    900: '#3E2723',
                },
                warm: {
                    bg: '#FFFDF7',
                    surface: '#FFFFFF',
                    text: '#2D2219',
                    muted: '#6B5D4F',
                    faded: '#9E9183',
                    border: '#E8E0D5',
                    dark: '#1A1410',
                },
            },
            fontFamily: {
                heading: ['"Playfair Display"', 'Georgia', 'serif'],
                body: ['Inter', '-apple-system', '"Segoe UI"', 'sans-serif'],
            },
            fontSize: {
                '2xs': '0.65rem',
                'hero': 'clamp(2.8rem, 6vw, 5rem)',
                'section': 'clamp(2rem, 4vw, 3.2rem)',
            },
            borderRadius: {
                '2xl': '20px',
                '3xl': '32px',
            },
            boxShadow: {
                'warm-sm': '0 1px 3px rgba(45, 34, 25, 0.06)',
                'warm-md': '0 4px 12px rgba(45, 34, 25, 0.08)',
                'warm-lg': '0 8px 30px rgba(45, 34, 25, 0.12)',
                'warm-xl': '0 16px 48px rgba(45, 34, 25, 0.16)',
                'glow': '0 0 40px rgba(255, 193, 7, 0.25)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-slow': 'float 8s ease-in-out infinite',
                'pulse-slow': 'pulse 2s ease-in-out infinite',
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                fadeInUp: {
                    from: { opacity: '0', transform: 'translateY(30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
};
