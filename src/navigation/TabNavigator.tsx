import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Truck, Plus, History, BarChart3 } from "lucide-react-native";
import { DashboardScreen } from "../screens/DashboardScreen";
import { VehiclesScreen } from "../screens/VehiclesScreen";
import { AddTransactionScreen } from "../screens/AddTransactionScreen";
import { ReportsScreen } from "../screens/ReportsScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { colors } from "../theme/theme";

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, typeof Home> = {
  Home: Home,
  Vehicles: Truck,
  Add: Plus,
  Reports: BarChart3,
  History: History,
};

function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
      <View style={styles.tabBarTint} />
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.glow,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <TabBarBackground />,
        tabBarLabelStyle: { fontSize: 10.5 },
        tabBarIcon: ({ focused, color }) => {
          const Icon = TAB_ICONS[route.name] ?? Home;
          return <Icon size={route.name === "Add" ? 20 : 18} color={color} strokeWidth={focused ? 2.4 : 2} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Vehicles" component={VehiclesScreen} />
      <Tab.Screen name="Add" component={AddTransactionScreen} options={{ tabBarLabel: "Add" }} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    backgroundColor: "transparent",
    elevation: 0,
    height: 68,
    paddingTop: 8,
  },
  tabBarTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});
