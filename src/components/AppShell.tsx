import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { BackgroundGlow } from "./BackgroundGlow";
import { colors } from "../theme/theme";

/**
 * On the web this renders a centered "phone" card floating on a gradient
 * desktop background. On an actual mobile device the app already IS the
 * phone, so here we just apply the sky gradient + glow behind the content
 * and let each screen's own ScrollView handle scrolling. The bottom tab
 * bar (see navigation/TabNavigator) plays the role of the web TabBar.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <BackgroundGlow />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.navyTop,
  },
  content: {
    flex: 1,
  },
});
