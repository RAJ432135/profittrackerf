import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChevronLeft, Fuel, Landmark, UserRound, Wrench, UtensilsCrossed, MoreHorizontal, ShoppingBag, Home, Users, Zap } from "lucide-react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { GhostButton } from "../components/GhostButton";
import { Input } from "../components/Input";
import { useAppData } from "../context/AppDataContext";
import { colors, rupee } from "../theme/theme";
import { CATEGORY_LABELS, type Transaction, type TransactionCategory } from "../types/domain";
import { inRange, PERIOD_LABELS, resolvePeriod, type PeriodKey } from "../utils/dateRanges";

const EXPENSE_ICON: Record<TransactionCategory, typeof Fuel> = {
  Trip: Landmark,
  Diesel: Fuel,
  Toll: Landmark,
  Driver: UserRound,
  Sale: ShoppingBag,
  Rent: Home,
  Stock: ShoppingBag,
  Staff: Users,
  Electricity: Zap,
  Maintenance: Wrench,
  Food: UtensilsCrossed,
  Other: MoreHorizontal,
};

const PERIODS: PeriodKey[] = ["today", "month", "year", "custom"];
const MONTHS_BACK = 5; // current month + 4 previous, matching the spec's example list

export function VehicleDetailScreen({ navigation, route }: any) {
  const { vehicleId } = route.params as { vehicleId: string };
  const { vehicles, transactions } = useAppData();
  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const [period, setPeriod] = useState<PeriodKey>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const range = useMemo(() => resolvePeriod(period, customFrom, customTo), [period, customFrom, customTo]);

  const vehicleTxns = useMemo(
    () => transactions.filter((t) => t.vehicleId === vehicleId && inRange(t, range.from, range.to)),
    [transactions, vehicleId, range]
  );

  const income = useMemo(() => vehicleTxns.filter((t) => t.type === "Income"), [vehicleTxns]);
  const expenses = useMemo(() => vehicleTxns.filter((t) => t.type === "Expense"), [vehicleTxns]);

  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
  const profit = totalIncome - totalExpense;

  const expenseByCategory = useMemo(() => {
    const map: Partial<Record<TransactionCategory, number>> = {};
    expenses.forEach((t) => (map[t.category] = (map[t.category] ?? 0) + t.amount));
    return Object.entries(map).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  }, [expenses]);

  const recent = useMemo(
    () => [...vehicleTxns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15),
    [vehicleTxns]
  );

  // "Previous months" — full history, always visible. this month is listed
  // first, older months follow.
  const monthlyHistory = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; profit: number; isCurrent: boolean }[] = [];
    for (let i = 0; i < MONTHS_BACK; i++) {
      const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = ref.toLocaleDateString("en-IN", { month: "long" });
      const monthTxns = transactions.filter(
        (t) =>
          t.vehicleId === vehicleId &&
          new Date(t.date).getFullYear() === ref.getFullYear() &&
          new Date(t.date).getMonth() === ref.getMonth()
      );
      const monthProfit = monthTxns.reduce((s, t) => s + (t.type === "Income" ? t.amount : -t.amount), 0);
      months.push({ key: `${ref.getFullYear()}-${ref.getMonth()}`, label, profit: monthProfit, isCurrent: i === 0 });
    }
    return months;
  }, [transactions, vehicleId]);

  if (!vehicle) {
    return (
      <AppShell>
        <View style={styles.notFound}>
          <Text style={styles.faint}>Vehicle not found.</Text>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{vehicle.vehicleNumber}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {PERIODS.map((p) => (
              <GhostButton key={p} active={period === p} onPress={() => setPeriod(p)}>
                {p === "custom" ? "Custom range" : PERIOD_LABELS[p]}
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

        <GlassCard style={styles.heroCard}>
          <Text style={styles.heroLabel}>Profit {period === "custom" ? "for this range" : PERIOD_LABELS[period].toLowerCase()}</Text>
          <Text style={[styles.heroAmount, { color: profit >= 0 ? colors.text : colors.expense }]}>{rupee(profit)}</Text>
          <View style={styles.heroStatsRow}>
            <View>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={[styles.statValue, { color: colors.income }]}>{rupee(totalIncome)}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Expense</Text>
              <Text style={[styles.statValue, { color: colors.expense }]}>{rupee(totalExpense)}</Text>
            </View>
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>Previous months</Text>
        <GlassCard style={styles.listCard}>
          {monthlyHistory.map((m) => (
            <View key={m.key} style={styles.listRow}>
              <Text style={styles.rowLabel}>{m.label}</Text>
              <Text style={[styles.rowValue, { color: m.profit >= 0 ? colors.income : colors.expense }]}>
                {rupee(m.profit)}
              </Text>
            </View>
          ))}
        </GlassCard>

        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Expenses</Text>
        <GlassCard style={styles.listCard}>
          {expenseByCategory.length === 0 && <Text style={styles.faint}>No expenses in this period.</Text>}
          {expenseByCategory.map(([cat, amount]) => {
            const Icon = EXPENSE_ICON[cat as TransactionCategory];
            return (
              <View key={cat} style={styles.listRow}>
                <View style={styles.rowLeft}>
                  <Icon size={15} color={colors.expense} />
                  <Text style={styles.rowLabel}>{CATEGORY_LABELS[cat as TransactionCategory]}</Text>
                </View>
                <Text style={[styles.rowValue, { color: colors.expense }]}>{rupee(amount ?? 0)}</Text>
              </View>
            );
          })}
        </GlassCard>

        <Text style={styles.sectionTitle}>Income</Text>
        <GlassCard style={styles.listCard}>
          {income.length === 0 && <Text style={styles.faint}>No income in this period.</Text>}
          {income.map((t, idx) => (
            <View key={t.id} style={styles.listRow}>
              <Text style={styles.rowLabel}>
                {CATEGORY_LABELS[t.category]} {income.filter((i) => i.category === t.category).length > 1 ? idx + 1 : ""}
              </Text>
              <Text style={[styles.rowValue, { color: colors.income }]}>{rupee(t.amount)}</Text>
            </View>
          ))}
        </GlassCard>

        <Text style={styles.sectionTitle}>Recent transactions</Text>
        <View style={{ gap: 8 }}>
          {recent.length === 0 && <Text style={styles.faint}>Nothing recorded yet for this period.</Text>}
          {recent.map((t: Transaction) => {
            const isIncome = t.type === "Income";
            return (
              <GlassCard key={t.id} style={styles.txnRow}>
                <View>
                  <Text style={styles.txnDate}>
                    {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </Text>
                  <Text style={styles.txnLabel}>
                    {isIncome ? "Income" : CATEGORY_LABELS[t.category]}
                    {t.note ? ` — ${t.note}` : ""}
                  </Text>
                </View>
                <Text style={[styles.txnAmount, { color: isIncome ? colors.income : colors.expense }]}>
                  {isIncome ? "+" : "-"}
                  {rupee(t.amount)}
                </Text>
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
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: { marginBottom: 18, flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: "700", color: colors.text },
  faint: { fontSize: 13, color: colors.textFaint },
  heroCard: { paddingHorizontal: 22, paddingVertical: 24, marginBottom: 22, alignItems: "center" },
  heroLabel: { marginBottom: 8, fontSize: 13, color: colors.textMuted },
  heroAmount: { fontSize: 42, fontWeight: "700", letterSpacing: -1 },
  heroStatsRow: { flexDirection: "row", gap: 32, marginTop: 18 },
  statLabel: { fontSize: 12, color: colors.textFaint, marginBottom: 2, textAlign: "center" },
  statValue: { fontSize: 15, fontWeight: "700", textAlign: "center" },
  sectionTitle: { marginBottom: 10, fontSize: 14, fontWeight: "700", color: colors.text },
  listCard: { paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20, gap: 10 },
  listRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowLabel: { fontSize: 13.5, color: colors.textMuted },
  rowValue: { fontSize: 13.5, fontWeight: "700" },
  txnRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  txnDate: { fontSize: 11, color: colors.textFaint },
  txnLabel: { marginTop: 2, fontSize: 13.5, fontWeight: "600", color: colors.text },
  txnAmount: { fontSize: 14, fontWeight: "700" },
});
