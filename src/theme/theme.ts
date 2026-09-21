/**
 * "Sky" theme — ported 1:1 from the web app's index.css tokens.
 * Light sky-blue gradient background, frosted glass cards, amber accent.
 */
export const colors = {
  navyTop: "#080B10",
  navyBottom: "#111925",
  navyCard: "#121A26",

  glow: "#C8FF3D",
  glowDark: "#66E58B",
  glowSoft: "rgba(200, 255, 61, 0.32)",
  glowFaint: "rgba(200, 255, 61, 0.12)",

  income: "#54E6A5",
  expense: "#FF6B85",
  incomeSoft: "rgba(84, 230, 165, 0.14)",
  expenseSoft: "rgba(255, 107, 133, 0.14)",

  glass: "rgba(20, 30, 44, 0.84)",
  glassStrong: "rgba(27, 39, 55, 0.96)",
  glassBorder: "rgba(206, 226, 245, 0.12)",
  ghostBg: "rgba(255, 255, 255, 0.055)",

  text: "#F4F8FC",
  textMuted: "rgba(232, 240, 248, 0.70)",
  textFaint: "rgba(232, 240, 248, 0.45)",

  onGlow: "#101707",
  white: "#F4F8FC",
};

export const gradientHeadlight = [colors.glow, colors.glowDark] as const;
export const gradientBackground = [colors.navyTop, colors.navyBottom] as const;

export const fonts = {
  // Merriweather stands in for the web app's serif "display" font on hero numbers.
  display: "Merriweather_700Bold",
  displayFallback: "System",
  sans: "System",
};

export const radii = {
  card: 20,
  sheet: 28,
  pill: 999,
  input: 14,
  icon: 11,
};

export function rupee(n: number): string {
  return "\u20B9" + Math.round(Math.abs(n)).toLocaleString("en-IN");
}
