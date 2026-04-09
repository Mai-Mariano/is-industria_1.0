// tailwind.config.js (ESM)
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: {
        brand: {
          50:"#eef6ff",100:"#d9eaff",200:"#b3d4ff",300:"#84b9ff",400:"#5296ff",
          500:"#0b3b66",600:"#0a3257",700:"#082a49",800:"#07233d",900:"#061d33",
        },
        accent: {
          50:"#f1fbf2",100:"#dcf7df",200:"#b9efc1",300:"#8fe69d",400:"#7ed957",
          500:"#5cc13e",600:"#43a12e",700:"#357f27",800:"#2c6523",900:"#25531f",
        },
      },
    },
  },
  plugins: [],
};
