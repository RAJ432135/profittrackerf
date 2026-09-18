import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Truck, Phone } from "lucide-react-native";
import { BackgroundGlow } from "../components/BackgroundGlow";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { colors, gradientHeadlight } from "../theme/theme";

export function ForgotPasswordScreen({ navigation }: any) {
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <View style={styles.root}>
      <BackgroundGlow />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <LinearGradient colors={gradientHeadlight} style={styles.logo}>
              <Truck size={26} color={colors.onGlow} strokeWidth={2.3} />
            </LinearGradient>
            <Text style={styles.title}>Reset your password</Text>
            <Text style={styles.subtitle}>
              {sent ? "We've sent a reset code to your phone." : "Enter your phone number and we'll text you a reset code."}
            </Text>
          </View>

          {!sent && (
            <Input label="Phone number" icon={<Phone size={16} color={colors.textFaint} />} placeholder="98765 43210" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          )}

          <Button size="lg" onPress={() => (sent ? navigation.navigate("Login") : setSent(true))} style={{ marginTop: 8 }}>
            {sent ? "Back to log in" : "Send reset code"}
          </Button>

          <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.linkBold}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navyTop },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 26, paddingVertical: 40 },
  header: { alignItems: "center", marginBottom: 32 },
  logo: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 21, fontWeight: "700", color: colors.text, letterSpacing: -0.3 },
  subtitle: { marginTop: 6, fontSize: 13.5, color: colors.textMuted, textAlign: "center" },
  linkBold: { fontSize: 13.5, fontWeight: "700", color: colors.glowDark },
  footer: { marginTop: 20, alignItems: "center" },
});
