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
        },
    },
    plugins: [],
}
