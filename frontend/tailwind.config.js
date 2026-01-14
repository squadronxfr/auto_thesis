/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#172B49',
                secondary: '#126FFF',
                accent: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                neutral: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'gradient-saas': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'gradient-light': 'linear-gradient(to bottom right, #f8fafc, #e0e7ff)',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            screens: {
                xs: '480px',
                phone: '600px',
                tablet: '768px',
                laptop: '992px',
                desktop: '1200px',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
                fadeIn: 'fadeIn 0.5s ease-in-out',
                wiggle: 'wiggle 0.8s ease-in-out',
                'line-through-hide': 'lineThroughHide 0.4s ease',
                lineGrow: 'lineGrow 0.5s ease-in-out',
            },
            keyframes: {
                fadeInUp: {
                    from: {
                        opacity: '0',
                        transform: 'translate(-50%, 20px)',
                    },
                    to: {
                        opacity: '1',
                        transform: 'translate(-50%, 0)',
                    },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                lineGrow: {
                    '0%': { height: '0%' },
                    '100%': { height: '100%' },
                },
                wiggle: {
                    '0%': { transform: 'rotate(0deg)' },
                    '20%': { transform: 'rotate(-5deg)' },
                    '40%': { transform: 'rotate(5deg)' },
                    '60%': { transform: 'rotate(-3deg)' },
                    '80%': { transform: 'rotate(3deg)' },
                    '100%': { transform: 'rotate(0deg)' },
                },
                lineThroughHide: {
                    '0%': { transform: 'scaleX(1)' },
                    '100%': { transform: 'scaleX(0)' },
                },
                lineGrow: {
                    '0%': { height: '0%' },
                    '100%': { height: '100%' },
                },
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};
