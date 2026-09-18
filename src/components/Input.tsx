import React, { type ReactNode } from "react";
import { StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { colors, radii } from "../theme/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({ label, error, icon, containerStyle, style, ...rest }: InputProps) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.field, error ? styles.fieldError : styles.fieldNormal]}>
        {icon}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textFaint}
          {...rest}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    marginBottom: 14,
  },
  label: {
    marginBottom: 6,
    fontSize: 12.5,
    fontWeight: "500",
    color: colors.textMuted,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radii.input,
    borderWidth: 1,
    backgroundColor: colors.ghostBg,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  fieldNormal: {
    borderColor: colors.glassBorder,
  },
  fieldError: {
    borderColor: colors.expense,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: colors.text,
    padding: 0,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500",
    color: colors.expense,
  },
});
