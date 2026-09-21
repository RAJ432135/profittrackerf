import React, { type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradientHeadlight } from "../theme/theme";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const sizePadding: Record<Size, { v: number; h: number; font: number }> = {
  sm: { v: 10, h: 16, font: 13.5 },
  md: { v: 13, h: 20, font: 15 },
  lg: { v: 16, h: 24, font: 16 },
};

export function Button({ children, onPress, variant = "primary", size = "md", isLoading, disabled, style }: ButtonProps) {
  const pad = sizePadding[size];
  const isDisabled = disabled || isLoading;

  const textColor = variant === "primary" ? colors.onGlow : colors.text;
  const label =
    typeof children === "string" ? (
      <Text style={{ fontSize: pad.font, fontWeight: "700", color: textColor, letterSpacing: -0.2 }}>{children}</Text>
    ) : (
      children
    );

  const inner = (
    <View style={[styles.row, { paddingVertical: pad.v, paddingHorizontal: pad.h }]}>
      {isLoading && <ActivityIndicator size="small" color={textColor} style={{ marginRight: 8 }} />}
      {label}
    </View>
  );

  if (variant === "primary") {
    return (
      <Pressable onPress={onPress} disabled={isDisabled} style={({ pressed }) => [{ opacity: isDisabled ? 0.5 : pressed ? 0.92 : 1 }, style]}>
        <LinearGradient colors={gradientHeadlight} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientShape}>
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.gradientShape,
        variant === "secondary" ? styles.secondary : styles.ghostVariant,
        { opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradientShape: {
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.ghostBg,
  },
  ghostVariant: {
    backgroundColor: "transparent",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
