import React, { useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fuel, Landmark, UserRound, Wrench, UtensilsCrossed, MoreHorizontal, ShoppingBag, Home, Users, Zap, Search, Pencil, Trash2, X } from "lucide-react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { GhostButton } from "../components/GhostButton";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { DatePickerField, DateRangePicker } from "../components/DateRangePicker";
import { useAppData } from "../context/AppDataContext";
import { colors, rupee } from "../theme/theme";
import {
  CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type Transaction,
  type TransactionCategory,
  type TransactionType,
} from "../types/domain";
import { inRange, PERIOD_LABELS, resolvePeriod, totalsFor, type PeriodKey } from "../utils/dateRanges";

const CATEGORY_ICON: Record<TransactionCategory, typeof Fuel> = {
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

const PERIODS: PeriodKey[] = ["today", "month", "year", "all", "custom"];

export function HistoryScreen() {
  const { vehicles, transactions, updateTransaction, removeTransaction } = useAppData();
  const [period, setPeriod] = useState<PeriodKey>("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "">("");
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | "">("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editCategory, setEditCategory] = useState<TransactionCategory>("Trip");
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

  const range = useMemo(() => resolvePeriod(period, customFrom, customTo), [period, customFrom, customTo]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (!inRange(t, range.from, range.to)) return false;
      if (vehicleFilter && t.vehicleId !== vehicleFilter) return false;
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (typeFilter && t.type !== typeFilter) return false;
      if (q && !t.vehicleNumber.toLowerCase().includes(q) && !(t.note ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [transactions, range, vehicleFilter, categoryFilter, typeFilter, search]);

  const { income, expense } = totalsFor(filtered);

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setEditAmount(String(t.amount));
    setEditDate(new Date(t.date).toISOString().slice(0, 10));
    setEditNote(t.note ?? "");
    setEditCategory(t.category);
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    updateTransaction(editing.id, {
      category: editCategory,
      amount: Number(editAmount.replace(/,/g, "")) || 0,
      date: new Date(editDate).toISOString(),
      note: editNote || undefined,
    });
    setEditing(null);
  };

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>History</Text>
          <TouchableOpacity onPress={() => setShowFilters((s) => !s)}>
            <Text style={styles.filterToggle}>{showFilters ? "Hide filters" : "More filters"}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
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

        {showFilters && (
          <View style={{ gap: 12, marginBottom: 12 }}>
            <Input icon={<Search size={15} color={colors.textFaint} />} placeholder="Search by note or vehicle number" value={search} onChangeText={setSearch} />

            <View>
              <Text style={styles.filterLabel}>Vehicle</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <GhostButton active={vehicleFilter === ""} onPress={() => setVehicleFilter("")}>All</GhostButton>
                  {vehicles.map((v) => (
                    <GhostButton key={v.id} active={vehicleFilter === v.id} onPress={() => setVehicleFilter(v.id)}>
                      {v.vehicleNumber}
                    </GhostButton>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View>
              <Text style={styles.filterLabel}>Type</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(["", "Income", "Expense"] as const).map((t) => (
                  <GhostButton key={t || "all"} active={typeFilter === t} onPress={() => setTypeFilter(t)}>
                    {t || "All"}
                  </GhostButton>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.filterLabel}>Category</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <GhostButton active={categoryFilter === ""} onPress={() => setCategoryFilter("")}>All</GhostButton>
                {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map((c) => (
                  <GhostButton key={c} active={categoryFilter === c} onPress={() => setCategoryFilter(c)}>
                    {CATEGORY_LABELS[c]}
                  </GhostButton>
                ))}
              </View>
            </View>
          </View>
        )}

        <GlassCard style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, { color: colors.income }]}>{rupee(income)}</Text>
          </View>
          <View>
            <Text style={styles.summaryLabel}>Expense</Text>
            <Text style={[styles.summaryValue, { color: colors.expense }]}>{rupee(expense)}</Text>
          </View>
          <View>
            <Text style={styles.summaryLabel}>Profit</Text>
            <Text style={styles.summaryValue}>{rupee(income - expense)}</Text>
          </View>
        </GlassCard>

        {filtered.length === 0 && <Text style={styles.faint}>No transactions match these filters.</Text>}

        <View style={{ gap: 9 }}>
          {filtered.map((t) => {
            const Icon = CATEGORY_ICON[t.category];
            const isIncome = t.type === "Income";
            return (
              <GlassCard key={t.id} style={styles.txnRow}>
                <View style={[styles.txnIconWrap, { backgroundColor: isIncome ? colors.incomeSoft : colors.expenseSoft }]}>
                  <Icon size={16} color={isIncome ? colors.income : colors.expense} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txnVehicle}>{t.vehicleNumber}</Text>
                  <Text style={styles.txnMeta}>
                    {CATEGORY_LABELS[t.category]} · {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {t.note ? ` · ${t.note}` : ""}
                  </Text>
                </View>
                <Text style={[styles.txnAmount, { color: isIncome ? colors.income : colors.expense }]}>
                  {isIncome ? "+" : "-"}
                  {rupee(t.amount)}
                </Text>
                <TouchableOpacity style={styles.smallIconBtn} onPress={() => openEdit(t)}>
                  <Pencil size={14} color={colors.textFaint} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallIconBtn} onPress={() => setPendingDelete(t)}>
                  <Trash2 size={14} color={colors.expense} />
                </TouchableOpacity>
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>

      {/* Edit sheet */}
      <Modal visible={!!editing} transparent animationType="slide" onRequestClose={() => setEditing(null)}>
        <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={() => setEditing(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit {editing?.type.toLowerCase()}</Text>
              <TouchableOpacity onPress={() => setEditing(null)}>
                <X size={19} color={colors.textFaint} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetSubtitle}>{editing?.vehicleNumber}</Text>

            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.chipWrap}>
              {(editing?.type === "Income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                <GhostButton key={c} active={editCategory === c} onPress={() => setEditCategory(c)}>
                  {CATEGORY_LABELS[c]}
                </GhostButton>
              ))}
            </View>

            <Input
              label="Amount"
              icon={<Text style={{ fontSize: 15, fontWeight: "700", color: colors.textFaint }}>{"\u20B9"}</Text>}
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="decimal-pad"
            />
            <DatePickerField label="Transaction date" value={editDate} onChange={setEditDate} />
            <Input label="Note (optional)" value={editNote} onChangeText={setEditNote} />

            <Button size="lg" onPress={handleSaveEdit} style={{ marginTop: 8 }}>
              Save changes
            </Button>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Delete confirmation */}
      <Modal visible={!!pendingDelete} transparent animationType="fade" onRequestClose={() => setPendingDelete(null)}>
        <View style={styles.centerBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Delete this transaction?</Text>
            <Text style={styles.confirmBody}>
              This will permanently remove {pendingDelete ? rupee(pendingDelete.amount) : ""} {pendingDelete?.type.toLowerCase()} from{" "}
              <Text style={{ fontWeight: "700", color: colors.text }}>{pendingDelete?.vehicleNumber}</Text>.
            </Text>
            <View style={styles.confirmRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPendingDelete(null)}>
                <Text style={styles.cancelLabel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => {
                  if (pendingDelete) removeTransaction(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                <Text style={styles.deleteLabel}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 22, paddingTop: 26, paddingBottom: 24 },
  headerRow: { marginBottom: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 18, fontWeight: "700", color: colors.text },
  filterToggle: { fontSize: 12.5, fontWeight: "600", color: colors.glowDark },
  filterLabel: { marginBottom: 6, fontSize: 12.5, fontWeight: "500", color: colors.textMuted },
  faint: { fontSize: 13, color: colors.textFaint, marginBottom: 12 },
  summaryCard: { marginBottom: 18, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  summaryLabel: { fontSize: 11.5, color: colors.textFaint },
  summaryValue: { fontSize: 14, fontWeight: "700", color: colors.text },
  txnRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 15, paddingVertical: 13 },
  txnIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txnVehicle: { fontSize: 13.5, fontWeight: "600", color: colors.text },
  txnMeta: { fontSize: 11.5, color: colors.textFaint, marginTop: 1 },
  txnAmount: { fontSize: 14, fontWeight: "700" },
  smallIconBtn: { padding: 4 },

  sheetBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(6,9,20,0.55)" },
  sheet: { backgroundColor: colors.navyCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 22, paddingTop: 22, paddingBottom: 32, borderWidth: 1, borderColor: colors.glassBorder, maxHeight: "85%" },
  sheetHeader: { marginBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  sheetSubtitle: { marginBottom: 16, fontSize: 13, color: colors.textMuted },
  fieldLabel: { marginBottom: 8, fontSize: 12.5, fontWeight: "500", color: colors.textMuted },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },

  centerBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(6,9,20,0.6)", padding: 24 },
  confirmCard: { width: "100%", borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder, backgroundColor: colors.navyCard, padding: 24, alignItems: "center" },
  confirmTitle: { marginBottom: 6, fontSize: 15, fontWeight: "700", color: colors.text },
  confirmBody: { marginBottom: 20, fontSize: 13, color: colors.textMuted, textAlign: "center" },
  confirmRow: { flexDirection: "row", gap: 10, width: "100%" },
  cancelBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: colors.glassBorder, paddingVertical: 12, alignItems: "center" },
  cancelLabel: { fontSize: 14, fontWeight: "600", color: colors.textMuted },
  deleteBtn: { flex: 1, borderRadius: 12, backgroundColor: colors.expense, paddingVertical: 12, alignItems: "center" },
  deleteLabel: { fontSize: 14, fontWeight: "700", color: "#2a0a10" },
});
