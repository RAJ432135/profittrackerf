import React, { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radii } from "../theme/theme";

export function GhostButton({
  children,
  onPress,
  active,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        active ? styles.active : styles.inactive,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>{children}</Text>
      ) : (
        <View style={styles.row}>{children}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  active: {
    borderColor: "transparent",
    backgroundColor: colors.glow,
  },
  inactive: {
    borderColor: colors.glassBorder,
    backgroundColor: colors.ghostBg,
  },
  label: {
    fontSize: 13,
  },
  labelActive: {
    fontWeight: "700",
    color: colors.onGlow,
  },
  labelInactive: {
    fontWeight: "500",
    color: colors.textMuted,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
