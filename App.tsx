import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppDataProvider } from "./src/context/AppDataContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { colors } from "./src/theme/theme";

export const API_URL = "https://profittrackerb-production.up.railway.app";

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors, 
    background: colors.navyTop,
    card: colors.navyCard,
    text: colors.text,
    border: colors.glassBorder,
    primary: colors.glow,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <StatusBar style="light" />
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
