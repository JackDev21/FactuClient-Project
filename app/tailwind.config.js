/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
