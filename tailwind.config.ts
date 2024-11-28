import type { Config } from "tailwindcss";
import { createThemes } from "tw-colors";
import colors  from "tailwindcss/colors";

const baseColors = [
  "gray",
  "red",
  "yellow",
  "green",
  "blue",
  "indigo",
  "purple",
  "pink",
];

const shadeMapping = {
  "50": "900",
  "100": "800",
  "200": "700",
  "300": "600",
  "400": "500",
  "500": "400",
  "600": "300",
  "700": "200",
  "800": "100",
  "900": "50",
};

const generateThemeObject = ( colors: Record<string, Record<string, string>>, mapping: Record<string, string>, invert = false ) => {

  const theme: Record<string, Record<string, string>> = {};
   baseColors.forEach( ( color ) => {
    theme[color] = {};
    Object.entries(mapping).forEach( ( [key, value]: [string, string]) => {
      const shadeKey = invert ? value : key;
      theme[color][key] = colors[color][shadeKey];
    });
  });
  return theme;
};

const lightTheme = generateThemeObject(colors as unknown as Record<string, Record<string, string>>, shadeMapping);
const darkTheme = generateThemeObject(colors as unknown as Record<string, Record<string, string>>, shadeMapping, true);
 
const themes = {
  light: {
    ...lightTheme,
  white: "#ffffff",
},
dark: {
  ...darkTheme,
  white: colors.gray["950"],
  black: colors.gray["50"],
}

}

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [createThemes(themes)],
};
 export default config;
