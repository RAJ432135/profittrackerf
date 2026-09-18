import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppData } from "../context/AppDataContext";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { VehicleDetailScreen } from "../screens/VehicleDetailScreen";
import { TabNavigator } from "./TabNavigator";

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { user } = useAppData();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
