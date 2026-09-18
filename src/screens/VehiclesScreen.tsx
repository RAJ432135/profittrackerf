import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Pencil, Trash2, Plus, X, Truck, Store } from "lucide-react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { GhostButton } from "../components/GhostButton";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useAppData } from "../context/AppDataContext";
import { colors } from "../theme/theme";
import {
  BUSINESS_TYPE_LABELS,
  businessTypeOf,
  subtypesFor,
  unitNameLabel,
  VEHICLE_TYPE_LABELS,
  type BusinessType,
  type Vehicle,
  type VehicleType,
} from "../types/domain";
import { getUnitIcon } from "../utils/unitIcons";

type ModalMode = { kind: "add" } | { kind: "edit"; vehicle: Vehicle } | null;

export function VehiclesScreen({ navigation }: any) {
  const { vehicles, addVehicle, updateVehicle, removeVehicle } = useAppData();
  const [modal, setModal] = useState<ModalMode>(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("Vehicle");
  const [vehicleType, setVehicleType] = useState<VehicleType>("Truck");
  const [pendingDelete, setPendingDelete] = useState<Vehicle | null>(null);

  const openAdd = () => {
    setVehicleNumber("");
    setBusinessType("Vehicle");
    setVehicleType("Truck");
    setModal({ kind: "add" });
  };

  const openEdit = (v: Vehicle) => {
    setVehicleNumber(v.vehicleNumber);
    setBusinessType(businessTypeOf(v.vehicleType));
    setVehicleType(v.vehicleType);
    setModal({ kind: "edit", vehicle: v });
  };

  const selectBusinessType = (b: BusinessType) => {
    setBusinessType(b);
    setVehicleType(subtypesFor(b)[0]);
  };

  const handleSave = () => {
    if (!vehicleNumber.trim()) return;
    if (modal?.kind === "edit") {
      updateVehicle(modal.vehicle.id, vehicleNumber.trim(), vehicleType);
    } else {
      addVehicle(vehicleNumber.trim(), vehicleType);
    }
    setModal(null);
  };

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Vehicles &amp; Shops</Text>

        <View style={{ gap: 10, marginBottom: 20 }}>
          {vehicles.length === 0 && <Text style={styles.faint}>No vehicles or shops yet.</Text>}
          {vehicles.map((v) => {
            const Icon = getUnitIcon(v.vehicleType);
            return (
              <GlassCard
                key={v.id}
                style={styles.row}
                onPress={() => navigation.navigate("VehicleDetail", { vehicleId: v.id })}
              >
                <View style={styles.iconWrap}>
                  <Icon size={19} color={colors.glow} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleNumber}>{v.vehicleNumber}</Text>
                  <Text style={styles.vehicleType}>{VEHICLE_TYPE_LABELS[v.vehicleType]}</Text>
                </View>
                <TouchableOpacity style={styles.smallIconBtn} onPress={() => openEdit(v)}>
                  <Pencil size={16} color={colors.textFaint} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallIconBtn} onPress={() => setPendingDelete(v)}>
                  <Trash2 size={16} color={colors.expense} />
                </TouchableOpacity>
              </GlassCard>
            );
          })}
        </View>

        <TouchableOpacity style={styles.addVehicleBtn} onPress={openAdd}>
          <Plus size={16} color={colors.textMuted} />
          <Text style={styles.addVehicleLabel}>Add vehicle or shop</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add / Edit sheet */}
      <Modal visible={!!modal} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={() => setModal(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{modal?.kind === "edit" ? "Edit" : "What are you adding?"}</Text>
              <TouchableOpacity onPress={() => setModal(null)}>
                <X size={19} color={colors.textFaint} />
              </TouchableOpacity>
            </View>

            {/* Step 1 — equal-weight Vehicle / Shop toggle, same treatment as Income/Expense elsewhere */}
            <View style={styles.businessRow}>
              {(["Vehicle", "Shop"] as BusinessType[]).map((b) => {
                const active = businessType === b;
                const Icon = b === "Vehicle" ? Truck : Store;
                return (
                  <TouchableOpacity
                    key={b}
                    onPress={() => selectBusinessType(b)}
                    style={[
                      styles.businessBtn,
                      { borderColor: active ? "transparent" : colors.glassBorder, backgroundColor: active ? colors.glow : "rgba(255,255,255,0.04)" },
                    ]}
                  >
                    <Icon size={22} color={active ? colors.onGlow : colors.textMuted} strokeWidth={2.2} />
                    <Text style={{ marginTop: 6, fontSize: 14, fontWeight: "700", color: active ? colors.onGlow : colors.textMuted }}>
                      {BUSINESS_TYPE_LABELS[b]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Step 2 — only the sub-types relevant to the chosen business type */}
            <Text style={styles.fieldLabel}>{businessType === "Vehicle" ? "Vehicle type" : "Shop type"}</Text>
            <View style={styles.chipWrap}>
              {subtypesFor(businessType).map((t) => (
                <GhostButton key={t} active={vehicleType === t} onPress={() => setVehicleType(t)}>
                  {VEHICLE_TYPE_LABELS[t]}
                </GhostButton>
              ))}
            </View>

            <Input
              label={unitNameLabel(vehicleType)}
              placeholder={businessType === "Vehicle" ? "BR05 AB 1234" : "Main Branch, Patna"}
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
            />

            <Button size="lg" onPress={handleSave} style={{ marginTop: 8 }}>
              {modal?.kind === "edit" ? "Save changes" : "Save"}
            </Button>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Delete confirmation */}
      <Modal visible={!!pendingDelete} transparent animationType="fade" onRequestClose={() => setPendingDelete(null)}>
        <View style={styles.centerBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Delete this?</Text>
            <Text style={styles.confirmBody}>
              This will permanently remove <Text style={{ fontWeight: "700", color: colors.text }}>{pendingDelete?.vehicleNumber}</Text> and its
              transaction history won't show up on the dashboard anymore.
            </Text>
            <View style={styles.confirmRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPendingDelete(null)}>
                <Text style={styles.cancelLabel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => {
                  if (pendingDelete) removeVehicle(pendingDelete.id);
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
  title: { marginBottom: 20, fontSize: 18, fontWeight: "700", color: colors.text },
  faint: { fontSize: 13, color: colors.textFaint },
  row: { flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 16, paddingVertical: 15 },
  iconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.glowFaint, alignItems: "center", justifyContent: "center" },
  vehicleNumber: { fontSize: 14.5, fontWeight: "600", color: colors.text },
  vehicleType: { marginTop: 2, fontSize: 12, color: colors.textFaint },
  smallIconBtn: { padding: 6 },
  addVehicleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.glassBorder,
    paddingVertical: 14,
  },
  addVehicleLabel: { fontSize: 14, fontWeight: "600", color: colors.textMuted },

  sheetBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(6,9,20,0.55)" },
  sheet: {
    backgroundColor: colors.navyCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  sheetHeader: { marginBottom: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  businessRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  businessBtn: { flex: 1, borderRadius: 14, borderWidth: 1.5, paddingVertical: 16, alignItems: "center" },
  fieldLabel: { marginBottom: 8, fontSize: 12.5, fontWeight: "500", color: colors.textMuted },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 22 },

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
