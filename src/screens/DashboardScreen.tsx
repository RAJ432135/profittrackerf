import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LogOut, Plus, UserRound, ChevronRight } from "lucide-react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";
import { useAppData } from "../context/AppDataContext";
import { colors, rupee } from "../theme/theme";
import { getUnitIcon } from "../utils/unitIcons";

export function DashboardScreen({ navigation }: any) {
  const { user, logout, dashboardToday } = useAppData();

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.faint}>Welcome back</Text>
            <Text style={styles.name}>{user?.name ?? "Driver"}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate("Profile")}>
              <UserRound size={18} color={colors.textFaint} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={logout}>
              <LogOut size={18} color={colors.textFaint} />
            </TouchableOpacity>
          </View>
        </View>

        <GlassCard style={styles.heroCard}>
          <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE TODAY</Text></View>
          <Text style={styles.heroLabel}>Today's profit</Text>
          <Text style={styles.heroAmount}>{rupee(dashboardToday.totalProfit)}</Text>
        </GlassCard>

        <Button size="lg" style={styles.addBtn} onPress={() => navigation.navigate("Add")}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Plus size={17} color={colors.onGlow} strokeWidth={2.5} />
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.onGlow }}>Add income or expense</Text>
          </View>
        </Button>

        <Text style={styles.sectionTitle}>My vehicles &amp; shops</Text>
        <View style={{ gap: 10 }}>
          {dashboardToday.vehicles.length === 0 && (
            <Text style={styles.faintSmall}>Nothing yet — add a vehicle or shop from the Vehicles tab to get started.</Text>
          )}
          {dashboardToday.vehicles.map((v) => {
            const Icon = getUnitIcon(v.vehicleType);
            return (
              <GlassCard
                key={v.vehicleId}
                style={styles.vehicleRow}
                onPress={() => navigation.navigate("VehicleDetail", { vehicleId: v.vehicleId })}
              >
                <View style={styles.vehicleIconWrap}>
                  <Icon size={17} color={colors.glow} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleNumber}>{v.vehicleNumber}</Text>
                  <Text style={styles.faintSmall}>
                    {v.income > 0 || v.expense > 0 ? `Income ${rupee(v.income)} \u00b7 Expense ${rupee(v.expense)}` : "No entries today"}
                  </Text>
                </View>
                <Text style={[styles.vehicleProfit, { color: v.profit >= 0 ? colors.income : colors.expense }]}>
                  {rupee(v.profit)}
                </Text>
                <ChevronRight size={16} color={colors.textFaint} />
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 22, paddingTop: 26, paddingBottom: 24 },
  headerRow: { marginBottom: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  faint: { fontSize: 12.5, color: colors.textFaint },
  name: { fontSize: 17, fontWeight: "700", color: colors.text },
  headerIcons: { flexDirection: "row", alignItems: "center", gap: 4 },
  iconBtn: { padding: 9, borderRadius: 12, borderWidth: 1, borderColor: colors.glassBorder, backgroundColor: colors.ghostBg },
  heroCard: { paddingHorizontal: 22, paddingVertical: 24, marginBottom: 20, alignItems: "center", borderColor: "rgba(200,255,61,0.28)", backgroundColor: "rgba(24,38,37,0.92)" },
  livePill: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 11, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.glowFaint },
  liveDot: { width: 6, height: 6, borderRadius: 999, backgroundColor: colors.glow },
  liveText: { fontSize: 10, fontWeight: "800", letterSpacing: 1.1, color: colors.glow },
  heroLabel: { marginBottom: 8, fontSize: 13, color: colors.textMuted },
  heroAmount: { fontSize: 44, fontWeight: "700", color: colors.text, letterSpacing: -1 },
  addBtn: { marginBottom: 24 },
  sectionTitle: { marginBottom: 12, fontSize: 14, fontWeight: "700", color: colors.text },
  faintSmall: { fontSize: 12, color: colors.textFaint },
  vehicleRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  vehicleIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.glowFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleNumber: { fontSize: 14, fontWeight: "600", color: colors.text },
  vehicleProfit: { fontSize: 14.5, fontWeight: "700" },
});
