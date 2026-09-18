import React, { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fuel, Landmark, UserRound, Wrench, UtensilsCrossed, MoreHorizontal, ShoppingBag, Home, Users, Zap, Check } from "lucide-react-native";
import { AppShell } from "../components/AppShell";
import { GhostButton } from "../components/GhostButton";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useAppData } from "../context/AppDataContext";
import { colors, rupee } from "../theme/theme";
import { CATEGORY_LABELS, categoriesForUnitType, type TransactionCategory, type TransactionType } from "../types/domain";

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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function AddTransactionScreen({ navigation }: any) {
  const { vehicles, addTransaction } = useAppData();
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [txnType, setTxnType] = useState<TransactionType>("Income");
  const [category, setCategory] = useState<TransactionCategory>("Trip");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());
  const [confirming, setConfirming] = useState(false);

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const unitCategories = categoriesForUnitType(selectedVehicle?.vehicleType ?? "Other");
  const categories = txnType === "Income" ? unitCategories.income : unitCategories.expense;

  useEffect(() => {
    setCategory(categories[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txnType, vehicleId]);

  const handleConfirm = () => {
    addTransaction({
      vehicleId,
      type: txnType,
      category,
      amount: Number(amount.replace(/,/g, "")) || 0,
      date: new Date(date).toISOString(),
      note: note || undefined,
    });
    setConfirming(false);
    setAmount("");
    setNote("");
    navigation.navigate("Home");
  };

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Add income or expense</Text>

        <Text style={styles.fieldLabel}>Vehicle / Shop</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {vehicles.length === 0 && <Text style={styles.faint}>Add a vehicle or shop first.</Text>}
            {vehicles.map((v) => (
              <GhostButton key={v.id} active={vehicleId === v.id} onPress={() => setVehicleId(v.id)}>
                {v.vehicleNumber}
              </GhostButton>
            ))}
          </View>
        </ScrollView>

        <View style={styles.typeRow}>
          {(["Income", "Expense"] as TransactionType[]).map((t) => {
            const active = txnType === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setTxnType(t)}
                style={[
                  styles.typeBtn,
                  {
                    borderColor: active ? "transparent" : colors.glassBorder,
                    backgroundColor: active ? (t === "Income" ? colors.income : colors.expense) : "rgba(255,255,255,0.04)",
                  },
                ]}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: active ? "#0B1120" : colors.textMuted }}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.chipWrap}>
          {categories.map((c) => {
            const Icon = CATEGORY_ICON[c];
            const active = category === c;
            return (
              <GhostButton key={c} active={active} onPress={() => setCategory(c)}>
                <Icon size={13} color={active ? colors.onGlow : colors.textMuted} />
                <Text style={{ fontSize: 13, fontWeight: active ? "700" : "500", color: active ? colors.onGlow : colors.textMuted }}>
                  {" "}{CATEGORY_LABELS[c]}
                </Text>
              </GhostButton>
            );
          })}
        </View>

        <Input
          label="Amount"
          icon={<Text style={{ fontSize: 15, fontWeight: "700", color: colors.textFaint }}>{"\u20B9"}</Text>}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0"
        />

        <Input label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder={todayISO()} />

        <Input label="Note (optional)" placeholder="e.g. Patna trip" value={note} onChangeText={setNote} />

        <Button size="lg" disabled={!vehicleId || !amount} onPress={() => setConfirming(true)} style={{ marginTop: 8 }}>
          Save entry
        </Button>
        <Text style={styles.hint}>You'll confirm the amount before it's saved</Text>
      </ScrollView>

      <Modal visible={confirming} transparent animationType="fade" onRequestClose={() => setConfirming(false)}>
        <View style={styles.centerBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmLabel}>Confirm entry</Text>
            <Text style={styles.confirmTitle}>
              {txnType} · {CATEGORY_LABELS[category]}
            </Text>
            <Text style={styles.confirmDate}>
              {new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </Text>
            <Text style={styles.confirmAmount}>{rupee(Number(amount) || 0)}</Text>
            <View style={styles.confirmRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirming(false)}>
                <Text style={styles.cancelLabel}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                <Check size={15} color="#0B1120" />
                <Text style={styles.confirmBtnLabel}> Confirm</Text>
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
  title: { marginBottom: 20, fontSize: 18, fontWeight: "700", color: colors.text },
  fieldLabel: { marginBottom: 8, fontSize: 12.5, fontWeight: "500", color: colors.textMuted },
  faint: { fontSize: 13, color: colors.textFaint },
  typeRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  typeBtn: { flex: 1, borderRadius: 13, borderWidth: 1.5, paddingVertical: 14, alignItems: "center" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  hint: { marginTop: 10, textAlign: "center", fontSize: 11.5, color: colors.textFaint },

  centerBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(6,9,20,0.6)", padding: 24 },
  confirmCard: { width: "100%", borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder, backgroundColor: colors.navyCard, padding: 24, alignItems: "center" },
  confirmLabel: { fontSize: 14, color: colors.textMuted },
  confirmTitle: { marginTop: 2, fontSize: 15, fontWeight: "700", color: colors.text },
  confirmDate: { fontSize: 11.5, color: colors.textFaint },
  confirmAmount: { marginVertical: 10, fontSize: 30, fontWeight: "700", color: colors.text },
  confirmRow: { marginTop: 8, flexDirection: "row", gap: 10, width: "100%" },
  cancelBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: colors.glassBorder, paddingVertical: 12, alignItems: "center" },
  cancelLabel: { fontSize: 14, fontWeight: "600", color: colors.textMuted },
  confirmBtn: { flex: 1, flexDirection: "row", borderRadius: 12, backgroundColor: colors.income, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  confirmBtnLabel: { fontSize: 14, fontWeight: "700", color: "#0B1120" },
});
