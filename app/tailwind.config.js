/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        "xs": ["0.875rem", { lineHeight: "1.25rem" }],
        "sm": ["1rem", { lineHeight: "1.5rem" }],
        "base": ["1.125rem", { lineHeight: "1.65rem" }],
        "lg": ["1.25rem", { lineHeight: "1.75rem" }],
        "xl": ["1.375rem", { lineHeight: "1.875rem" }],
        "2xl": ["1.65rem", { lineHeight: "2.1rem" }],
      },
      backgroundImage: {
        "custom-gradient":
          "linear-gradient(to right, #7a4902, #7f5003, #835604, #885d06, #8c6408, #946c09, #9b740b, #a37c0c, #b0870c, #bd930b, #cb9e0a, #d8aa09)"
      },
      boxShadow: {
        "custom-shadow": "0px 5px 10px 5px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
}
