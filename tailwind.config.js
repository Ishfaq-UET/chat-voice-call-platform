import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
                display: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    DEFAULT: '#635bff',
                    deep: '#5046e5',
                    soft: '#eeedff',
                    muted: '#a5a0ff',
                },
                lilac: '#f3f0ff',
                mint: '#e7f8f0',
                skyish: '#e8f3ff',
                canvas: '#f7f7fc',
                ink: {
                    DEFAULT: '#1e1b4b',
                    soft: '#312e81',
                },
                coral: {
                    DEFAULT: '#635bff',
                    deep: '#5046e5',
                },
            },
            boxShadow: {
                soft: '0 10px 30px rgba(99, 91, 255, 0.18)',
                card: '0 12px 40px rgba(30, 27, 75, 0.08)',
                float: '0 20px 50px rgba(99, 91, 255, 0.22)',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
        },
    },

    plugins: [forms],
};
