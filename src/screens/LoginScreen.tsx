import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Truck, Phone, Lock } from "lucide-react-native";
import { BackgroundGlow } from "../components/BackgroundGlow";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { colors, gradientHeadlight } from "../theme/theme";
import { useAppData } from "../context/AppDataContext";

export function LoginScreen({ navigation }: any) {
  const { login } = useAppData();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = () => {
    setError(null);
    if (phone.trim().length < 6) {
      setError("Enter a valid phone number");
      return;
    }
    if (!password) {
      setError("Enter your password");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      login(phone.trim());
      setSubmitting(false);
    }, 400);
  };

  return (
    <View style={styles.root}>
      <BackgroundGlow />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <LinearGradient colors={gradientHeadlight} style={styles.logo}>
              <Truck size={26} color={colors.onGlow} strokeWidth={2.3} />
            </LinearGradient>
            <Text style={styles.title}>Vehicle Profit Tracker</Text>
            <Text style={styles.subtitle}>Har gadi ka profit, ek jagah</Text>
          </View>

          {error && (
            <View style={{ marginBottom: 16 }}>
              <Alert message={error} />
            </View>
          )}

          <Input
            label="Phone number"
            icon={<Phone size={16} color={colors.textFaint} />}
            placeholder="98765 43210"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Input
            label="Password"
            icon={<Lock size={16} color={colors.textFaint} />}
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.row}>
            <Text style={styles.muted}>Remember me</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={styles.link}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <Button size="lg" isLoading={submitting} onPress={onSubmit} style={{ marginTop: 8 }}>
            Log in
          </Button>

          <View style={styles.footer}>
            <Text style={styles.muted}>New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.linkBold}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navyTop },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 26, paddingVertical: 40 },
  header: { alignItems: "center", marginBottom: 32 },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 21, fontWeight: "700", color: colors.text, letterSpacing: -0.3 },
  subtitle: { marginTop: 6, fontSize: 13.5, color: colors.textMuted },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  muted: { fontSize: 13.5, color: colors.textMuted },
  link: { fontSize: 13, fontWeight: "600", color: colors.glowDark },
  linkBold: { fontSize: 13.5, fontWeight: "700", color: colors.glowDark },
  footer: { marginTop: 20, flexDirection: "row", justifyContent: "center" },
});
