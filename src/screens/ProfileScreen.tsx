import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { User as UserIcon, Phone, KeyRound, LogOut, ChevronRight } from "lucide-react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";
import { useAppData } from "../context/AppDataContext";
import { colors, gradientHeadlight } from "../theme/theme";

export function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAppData();

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Profile</Text>

        <GlassCard style={styles.profileCard}>
          <LinearGradient colors={gradientHeadlight} style={styles.avatar}>
            <UserIcon size={20} color={colors.onGlow} />
          </LinearGradient>
          <View>
            <Text style={styles.name}>{user?.name ?? "Driver"}</Text>
            <View style={styles.phoneRow}>
              <Phone size={12} color={colors.textFaint} />
              <Text style={styles.phone}> {user?.phone ?? "—"}</Text>
            </View>
          </View>
        </GlassCard>

        <Text style={styles.sectionLabel}>Account</Text>
        <GlassCard style={styles.accountCard}>
          <TouchableOpacity style={styles.accountRow} onPress={() => navigation.navigate("ForgotPassword")}>
            <KeyRound size={17} color={colors.textFaint} />
            <Text style={styles.accountLabel}>Change password</Text>
            <ChevronRight size={16} color={colors.textFaint} />
          </TouchableOpacity>
          <Text style={styles.accountNote}>We'll text a reset code to {user?.phone ?? "your phone"} to confirm it's you.</Text>
        </GlassCard>

        <Button variant="secondary" size="lg" onPress={logout}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <LogOut size={16} color={colors.text} />
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>Log out</Text>
          </View>
        </Button>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 22, paddingTop: 26, paddingBottom: 24 },
  title: { marginBottom: 20, fontSize: 18, fontWeight: "700", color: colors.text },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 20 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 15, fontWeight: "700", color: colors.text },
  phoneRow: { marginTop: 4, flexDirection: "row", alignItems: "center" },
  phone: { fontSize: 12.5, color: colors.textFaint },
  sectionLabel: { marginBottom: 8, fontSize: 12.5, fontWeight: "500", color: colors.textMuted },
  accountCard: { marginBottom: 24, overflow: "hidden" },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accountLabel: { flex: 1, fontSize: 13.5, fontWeight: "500", color: colors.text },
  accountNote: { paddingHorizontal: 16, paddingVertical: 10, fontSize: 11.5, color: colors.textFaint },
});
