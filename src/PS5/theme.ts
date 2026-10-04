import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const fontFamily = "Montserrat";

// Fonts are bundled in public/fonts so rendering works offline.
for (const weight of ["400", "600", "800", "900"]) {
  loadFont({
    family: fontFamily,
    url: staticFile(`fonts/montserrat-latin-${weight}-normal.woff2`),
    weight,
  });
}

export const COLORS = {
  night: "#00040f",
  deep: "#001446",
  blue: "#2f6bff",
  cyan: "#5ad1ff",
  white: "#ffffff",
  muted: "#9fb0d6",
};

export const SMOOTH = { damping: 200 };
export const BOUNCY = { damping: 14, stiffness: 120, mass: 0.8 };
