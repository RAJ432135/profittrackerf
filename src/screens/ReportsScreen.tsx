import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { GhostButton } from "../components/GhostButton";
import { DateRangePicker } from "../components/DateRangePicker";
import { useAppData } from "../context/AppDataContext";
import { getDashboardLastMonth, getDashboardRange, getDashboardWeek, getDashboardYear } from "../services/api";
import { colors, rupee } from "../theme/theme";
import { CATEGORY_LABELS, type TransactionCategory } from "../types/domain";
import { inRange, PERIOD_LABELS, resolvePeriod, totalsFor, type PeriodKey } from "../utils/dateRanges";

const PERIODS: PeriodKey[] = ["today", "week", "month", "lastMonth", "year", "custom"];

export function ReportsScreen() {
  const { vehicles, transactions, accessToken, recordEvent } = useAppData();
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);
  const [apiSummary, setApiSummary] = useState<{
    totalIncome: number;
    totalExpense: number;
    totalProfit: number;
    vehicles: Array<{
      vehicleId: string;
      vehicleNumber: string;
      income: number;
      expense: number;
      profit: number;
    }>;
  } | null>(null);

  // Fire once per screen visit, not once per period-tab switch — that's why this
  // is its own effect with an empty dependency array rather than folded into
  // the data-fetching effect below.
  useEffect(() => {
    recordEvent("report_viewed");
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setApiSummary(null);
      return;
    }

    const shouldUseApi = period === "week" || period === "lastMonth" || period === "year" || (period === "custom" && customFrom && customTo);
    if (!shouldUseApi) {
      setApiSummary(null);
      return;
    }

    let cancelled = false;

    const loadSummary = async () => {
      try {
        let summary: any = null;

        if (period === "week") {
          summary = await getDashboardWeek(accessToken);
        } else if (period === "lastMonth") {
          summary = await getDashboardLastMonth(accessToken);
        } else if (period === "year") {
          summary = await getDashboardYear(accessToken, new Date().getFullYear());
        } else if (period === "custom") {
          summary = await getDashboardRange(accessToken, customFrom, customTo);
        }

        if (!cancelled && summary) {
          setApiSummary({
            totalIncome: Number(summary.totalIncome ?? 0),
            totalExpense: Number(summary.totalExpense ?? 0),
            totalProfit: Number(summary.totalProfit ?? 0),
            vehicles: (summary.vehicles ?? []).map((v: any) => ({
              vehicleId: v.vehicleId ?? v.id ?? "",
              vehicleNumber: v.vehicleNumber ?? v.number ?? v.name ?? "",
              income: Number(v.income ?? 0),
              expense: Number(v.expense ?? 0),
              profit: Number(v.profit ?? (Number(v.income ?? 0) - Number(v.expense ?? 0))),
            })),
          });
        }
      } catch {
        if (!cancelled) setApiSummary(null);
      }
    };

    loadSummary();
    return () => {
      cancelled = true;
    };
  }, [accessToken, period, customFrom, customTo]);

  const range = useMemo(() => resolvePeriod(period, customFrom, customTo), [period, customFrom, customTo]);

  const filtered = useMemo(
    () => transactions.filter((t) => inRange(t, range.from, range.to)),
    [transactions, range]
  );

  const totals = useMemo(() => {
    if (apiSummary) {
      return {
        income: apiSummary.totalIncome,
        expense: apiSummary.totalExpense,
        profit: apiSummary.totalProfit,
        tripCount: 0,
        transactionCount: 0,
      };
    }

    return totalsFor(filtered);
  }, [apiSummary, filtered]);

  const expenseCategories = useMemo(() => {
    if (apiSummary) {
      return {} as Partial<Record<TransactionCategory, number>>;
    }

    const map: Partial<Record<TransactionCategory, number>> = {};
    filtered.filter((t) => t.type === "Expense").forEach((t) => (map[t.category] = (map[t.category] ?? 0) + t.amount));
    return map;
  }, [apiSummary, filtered]);

  const tripIncome = useMemo(() => {
    if (apiSummary) return 0;
    return filtered.filter((t) => t.type === "Income" && t.category === "Trip").reduce((s, t) => s + t.amount, 0);
  }, [apiSummary, filtered]);

  const vehicleAgg = useMemo(() => {
    if (apiSummary) {
      return apiSummary.vehicles.map((v) => ({
        vehicleId: v.vehicleId,
        vehicleNumber: v.vehicleNumber,
        income: v.income,
        expense: v.expense,
        profit: v.profit,
        categories: {} as Record<string, number>,
        tripCount: 0,
      }));
    }

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
  }, [apiSummary, vehicles, filtered]);

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
          <DateRangePicker from={customFrom} to={customTo} onChange={(from, to) => { setCustomFrom(from); setCustomTo(to); }} />
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
          {(Object.entries(expenseCategories) as Array<[string, number]> )
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amount]) => (
              <View key={cat} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{CATEGORY_LABELS[cat as TransactionCategory]}</Text>
                <Text style={[styles.breakdownValue, { color: colors.expense }]}>{rupee(amount)}</Text>
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
                    {(Object.entries(v.categories as Record<string, number>) as Array<[string, number]>)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, amount]) => (
                        <View key={cat} style={styles.categoryRow}>
                          <Text style={styles.categoryLabel}>{CATEGORY_LABELS[cat as TransactionCategory]}</Text>
                          <Text style={styles.categoryValue}>{rupee(amount)}</Text>
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
