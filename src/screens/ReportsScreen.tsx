import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { GhostButton } from "../components/GhostButton";
import { Input } from "../components/Input";
import { useAppData } from "../context/AppDataContext";
import { colors, rupee } from "../theme/theme";
import { CATEGORY_LABELS, type TransactionCategory } from "../types/domain";
import { inRange, PERIOD_LABELS, resolvePeriod, totalsFor, type PeriodKey } from "../utils/dateRanges";

const PERIODS: PeriodKey[] = ["today", "week", "month", "lastMonth", "year", "custom"];

export function ReportsScreen() {
  const { vehicles, transactions } = useAppData();
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);

  const range = useMemo(() => resolvePeriod(period, customFrom, customTo), [period, customFrom, customTo]);

  const filtered = useMemo(
    () => transactions.filter((t) => inRange(t, range.from, range.to)),
    [transactions, range]
  );

  const totals = useMemo(() => totalsFor(filtered), [filtered]);

  const expenseCategories = useMemo(() => {
    const map: Partial<Record<TransactionCategory, number>> = {};
    filtered.filter((t) => t.type === "Expense").forEach((t) => (map[t.category] = (map[t.category] ?? 0) + t.amount));
    return map;
  }, [filtered]);

  const tripIncome = useMemo(
    () => filtered.filter((t) => t.type === "Income" && t.category === "Trip").reduce((s, t) => s + t.amount, 0),
    [filtered]
  );

  const vehicleAgg = useMemo(() => {
    return vehicles
      .map((v) => {
        const txns = filtered.filter((t) => t.vehicleId === v.id);
        const income = txns.filter((t) => t.type === "Income").reduce((s, t) => s + t.amount, 0);
        const expense = txns.filter((t) => t.type === "Expense").reduce((s, t) => s + t.amount, 0);
        const categories: Partial<Record<TransactionCategory, number>> = {};
        txns.forEach((t) => (categories[t.category] = (categories[t.category] ?? 0) + t.amount));
        const tripCount = txns.filter((t) => t.category === "Trip").length;
        return { vehicleId: v.id, vehicleNumber: v.vehicleNumber, income, expense, profit: income - expense, categories, tripCount };
      })
      .filter((v) => v.income > 0 || v.expense > 0);
  }, [vehicles, filtered]);

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Reports</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {PERIODS.map((p) => (
              <GhostButton key={p} active={period === p} onPress={() => setPeriod(p)}>
                {PERIOD_LABELS[p]}
              </GhostButton>
            ))}
          </View>
        </ScrollView>

        {period === "custom" && (
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            <Input containerStyle={{ flex: 1 }} label="From (YYYY-MM-DD)" value={customFrom} onChangeText={setCustomFrom} placeholder="2026-01-01" />
            <Input containerStyle={{ flex: 1 }} label="To (YYYY-MM-DD)" value={customTo} onChangeText={setCustomTo} placeholder="2026-12-31" />
          </View>
        )}

        <GlassCard style={styles.headlineCard}>
          <Text style={styles.headlineLabel}>Net profit · {PERIOD_LABELS[period]}</Text>
          <Text style={styles.headlineAmount}>{rupee(totals.profit)}</Text>
          <View style={styles.headlineStatsRow}>
            <View>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={[styles.statValue, { color: colors.income }]}>{rupee(totals.income)}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Expense</Text>
              <Text style={[styles.statValue, { color: colors.expense }]}>{rupee(totals.expense)}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Trips</Text>
              <Text style={styles.statValue}>{totals.tripCount}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Entries</Text>
              <Text style={styles.statValue}>{totals.transactionCount}</Text>
            </View>
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>Expense breakdown</Text>
        <GlassCard style={styles.breakdownCard}>
          {Object.keys(expenseCategories).length === 0 && <Text style={styles.faint}>No expenses in this period.</Text>}
          {Object.entries(expenseCategories)
            .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
            .map(([cat, amount]) => (
              <View key={cat} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{CATEGORY_LABELS[cat as TransactionCategory]}</Text>
                <Text style={[styles.breakdownValue, { color: colors.expense }]}>{rupee(amount ?? 0)}</Text>
              </View>
            ))}
          {tripIncome > 0 && (
            <View style={[styles.breakdownRow, styles.breakdownDivider]}>
              <Text style={styles.breakdownLabel}>Trips (income)</Text>
              <Text style={[styles.breakdownValue, { color: colors.income }]}>{rupee(tripIncome)}</Text>
            </View>
          )}
        </GlassCard>

        <Text style={styles.sectionTitle}>Vehicle performance</Text>
        <View style={{ gap: 10, marginBottom: 20 }}>
          {vehicleAgg.length === 0 && <Text style={styles.faint}>No activity in this period.</Text>}
          {vehicleAgg.map((v) => {
            const expanded = expandedVehicle === v.vehicleId;
            return (
              <GlassCard key={v.vehicleId} style={styles.vehicleCard}>
                <TouchableOpacity style={styles.vehicleHeader} onPress={() => setExpandedVehicle(expanded ? null : v.vehicleId)}>
                  <View>
                    <Text style={styles.vehicleNumber}>{v.vehicleNumber}</Text>
                    <Text style={styles.vehicleMeta}>
                      {rupee(v.income)} in · {rupee(v.expense)} out · {v.tripCount} trips
                    </Text>
                  </View>
                  <View style={styles.vehicleRight}>
                    <Text style={[styles.vehicleProfit, { color: v.profit >= 0 ? colors.income : colors.expense }]}>{rupee(v.profit)}</Text>
                    {expanded ? <ChevronUp size={16} color={colors.textFaint} /> : <ChevronDown size={16} color={colors.textFaint} />}
                  </View>
                </TouchableOpacity>
                {expanded && (
                  <View style={styles.expandedBlock}>
                    <Text style={styles.expandedTitle}>By category</Text>
                    {Object.entries(v.categories)
                      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
                      .map(([cat, amount]) => (
                        <View key={cat} style={styles.categoryRow}>
                          <Text style={styles.categoryLabel}>{CATEGORY_LABELS[cat as TransactionCategory]}</Text>
                          <Text style={styles.categoryValue}>{rupee(amount ?? 0)}</Text>
                        </View>
                      ))}
                  </View>
                )}
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
  title: { marginBottom: 16, fontSize: 18, fontWeight: "700", color: colors.text },
  faint: { fontSize: 13, color: colors.textFaint },
  headlineCard: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 20, marginBottom: 16 },
  headlineLabel: { marginBottom: 6, fontSize: 12.5, color: colors.textMuted },
  headlineAmount: { fontSize: 34, fontWeight: "700", color: colors.text, letterSpacing: -0.5 },
  headlineStatsRow: { flexDirection: "row", gap: 22, marginTop: 16, flexWrap: "wrap" },
  statLabel: { fontSize: 11.5, color: colors.textFaint },
  statValue: { fontSize: 14, fontWeight: "700", color: colors.text },
  sectionTitle: { marginBottom: 8, fontSize: 14, fontWeight: "700", color: colors.text },
  breakdownCard: { paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, gap: 10 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between" },
  breakdownDivider: { marginTop: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.glassBorder },
  breakdownLabel: { fontSize: 13, color: colors.textMuted },
  breakdownValue: { fontSize: 13.5, fontWeight: "600" },
  vehicleCard: { paddingHorizontal: 16, paddingVertical: 14 },
  vehicleHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  vehicleNumber: { fontSize: 13.5, fontWeight: "600", color: colors.text },
  vehicleMeta: { marginTop: 2, fontSize: 11.5, color: colors.textFaint },
  vehicleRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  vehicleProfit: { fontSize: 14, fontWeight: "700" },
  expandedBlock: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.glassBorder, gap: 6 },
  expandedTitle: { marginBottom: 2, fontSize: 11.5, fontWeight: "500", color: colors.textMuted },
  categoryRow: { flexDirection: "row", justifyContent: "space-between" },
  categoryLabel: { fontSize: 12.5, color: colors.textMuted },
  categoryValue: { fontSize: 12.5, fontWeight: "600", color: colors.text },
});
