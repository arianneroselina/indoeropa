/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                default: ['"Inter"', "system-ui", "sans-serif"],
                primary: ['"Roboto Condensed"', "system-ui", "sans-serif"],
            },
            colors: {
                primary: {
                    DEFAULT: "#20487a",
                    50: "#e6edf5",
                    100: "#cddbea",
                    200: "#9bb7d5",
                    300: "#6993c0",
                    400: "#3a6faa",
                    500: "#20487a",
                    600: "#1a3b64",
                    700: "#142e4d",
                    800: "#0f2137",
                    900: "#091521",
                },
                secondary: {
                    DEFAULT: "#991b1b", // Tailwind red-800
                    800: "#991b1b",
                    900: "#7f1d1d",
                },
            },
        },
    },
    plugins: [],
}
