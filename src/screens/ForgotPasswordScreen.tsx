import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Truck, Phone, KeyRound, Lock } from "lucide-react-native";
import { BackgroundGlow } from "../components/BackgroundGlow";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { colors, gradientHeadlight } from "../theme/theme";
import { useAppData } from "../context/AppDataContext";

// Three real steps, each backed by an actual API call:
//   1. "request"  -> POST /auth/forgot-password (sends a reset code)
//   2. "reset"    -> POST /auth/reset-password  (code + new password)
//   3. "done"     -> confirmation, back to Login
type Step = "request" | "reset" | "done";

export function ForgotPasswordScreen({ navigation }: any) {
  const { forgotPassword, resetPassword } = useAppData();

  const [step, setStep] = useState<Step>("request");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSendCode = async () => {
    setError(null);
    if (!phone.trim()) {
      setError("Enter your phone number.");
      return;
    }
    setSubmitting(true);
    try {
      await forgotPassword(phone.trim());
      setStep("reset");
    } catch (err: any) {
      setError(err?.message || "Could not send reset code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    if (!code.trim()) {
      setError("Enter the reset code sent to your phone.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(phone.trim(), code.trim(), newPassword);
      setStep("done");
    } catch (err: any) {
      setError(err?.message || "Could not reset password. Check your code and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const subtitle =
    step === "request"
      ? "Enter your phone number and we'll text you a reset code."
      : step === "reset"
      ? "Enter the code you received and choose a new password."
      : "Your password has been reset. You can log in now.";

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
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          {error && (
            <View style={{ marginBottom: 12 }}>
              <Alert message={error} />
            </View>
          )}

          {step === "request" && (
            <>
              <Input
                label="Phone number"
                icon={<Phone size={16} color={colors.textFaint} />}
                placeholder="98765 43210"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <Button size="lg" onPress={handleSendCode} disabled={submitting} style={{ marginTop: 8 }}>
                {submitting ? "Sending..." : "Send reset code"}
              </Button>
            </>
          )}

          {step === "reset" && (
            <>
              <Input
                label="Reset code"
                icon={<KeyRound size={16} color={colors.textFaint} />}
                placeholder="Enter the code from SMS"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
              />
              <Input
                label="New password"
                icon={<Lock size={16} color={colors.textFaint} />}
                placeholder="At least 6 characters"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <Input
                label="Confirm new password"
                icon={<Lock size={16} color={colors.textFaint} />}
                placeholder="Re-enter your new password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Button size="lg" onPress={handleResetPassword} disabled={submitting} style={{ marginTop: 8 }}>
                {submitting ? "Resetting..." : "Reset password"}
              </Button>
              <TouchableOpacity style={styles.footer} onPress={handleSendCode} disabled={submitting}>
                <Text style={styles.linkBold}>Resend code</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "done" && (
            <Button size="lg" onPress={() => navigation.navigate("Login")} style={{ marginTop: 8 }}>
              Back to log in
            </Button>
          )}

          {step !== "done" && (
            <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.linkBold}>Cancel</Text>
            </TouchableOpacity>
          )}
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