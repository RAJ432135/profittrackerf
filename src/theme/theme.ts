/**
 * "Sky" theme — ported 1:1 from the web app's index.css tokens.
 * Light sky-blue gradient background, frosted glass cards, amber accent.
 */
export const colors = {
  navyTop: "#bfe4fb",
  navyBottom: "#7fc8f5",
  navyCard: "#eaf6ff",

  glow: "#ffb454",
  glowDark: "#ff8a5b",
  glowSoft: "rgba(255, 180, 84, 0.35)",
  glowFaint: "rgba(255, 180, 84, 0.14)",

  income: "#059669",
  expense: "#e11d48",
  incomeSoft: "rgba(5, 150, 105, 0.14)",
  expenseSoft: "rgba(225, 29, 72, 0.14)",

  glass: "rgba(255, 255, 255, 0.55)",
  glassStrong: "rgba(255, 255, 255, 0.75)",
  glassBorder: "rgba(10, 14, 31, 0.1)",
  ghostBg: "rgba(0, 0, 0, 0.04)",

  text: "#0a0e1f",
  textMuted: "rgba(10, 14, 31, 0.62)",
  textFaint: "rgba(10, 14, 31, 0.42)",

  onGlow: "#171008",
  white: "#ffffff",
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
  card: 18,
  sheet: 24,
  pill: 999,
  input: 12,
  icon: 11,
};

export function rupee(n: number): string {
  return "\u20B9" + Math.round(Math.abs(n)).toLocaleString("en-IN");
}
