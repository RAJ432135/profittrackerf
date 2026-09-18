import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/theme";

export function Alert({ message, tone = "expense" }: { message: string; tone?: "expense" | "income" }) {
  const isExpense = tone === "expense";
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: isExpense ? "rgba(225,29,72,0.12)" : "rgba(5,150,105,0.12)",
          borderColor: isExpense ? "rgba(225,29,72,0.3)" : "rgba(5,150,105,0.3)",
        },
      ]}
    >
      <Text style={[styles.text, { color: isExpense ? colors.expense : colors.income }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
  },
});
