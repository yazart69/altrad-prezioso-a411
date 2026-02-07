import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // C'est ici que Tailwind cherche vos fichiers.
    // Si ces lignes sont fausses, le site reste blanc.
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}", 
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Sécurité au cas où vous avez un dossier src
  ],
  theme: {
    extend: {
      colors: {
        flat: {
          bg: '#f0f2f5',
          sidebar: '#2c3e50',
          primary: '#ff7675',
          secondary: '#55efc4',
          accent: '#74b9ff',
          warning: '#ffeaa7',
          text: '#2d3436',
          muted: '#636e72',
          white: '#ffffff',
        }
      },
    },
  },
  plugins: [],
};
export default config;