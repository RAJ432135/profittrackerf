import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradientBackground } from "../theme/theme";

/**
 * Full-screen sky gradient with two soft blurred glow blobs, matching the
 * web app's fixed decorative background behind the phone-shaped card.
 */
export function BackgroundGlow() {
  return (
    <LinearGradient colors={gradientBackground} style={StyleSheet.absoluteFill}>
      <View
        pointerEvents="none"
        style={[styles.blob, { top: -110, left: -112, width: 340, height: 340, backgroundColor: colors.glow, opacity: 0.12 }]}
      />
      <View
        pointerEvents="none"
        style={[styles.blob, { bottom: -130, right: -110, width: 380, height: 380, backgroundColor: "#477DFF", opacity: 0.18 }]}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
});
