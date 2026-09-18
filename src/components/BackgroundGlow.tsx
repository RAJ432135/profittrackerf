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
    <LinearGradient colors={gradientBackground} style={StyleSheet.absoluteFillObject}>
      <View
        pointerEvents="none"
        style={[styles.blob, { top: -96, left: -96, width: 320, height: 320, backgroundColor: colors.glow, opacity: 0.14 }]}
      />
      <View
        pointerEvents="none"
        style={[styles.blob, { bottom: -120, right: -96, width: 360, height: 360, backgroundColor: "#3B82F6", opacity: 0.12 }]}
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
