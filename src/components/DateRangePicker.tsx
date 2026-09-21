import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, { type DateTimePickerChangeEvent } from "@react-native-community/datetimepicker";
import { CalendarDays } from "lucide-react-native";
import { colors, radii } from "../theme/theme";

type Selecting = "from" | "to" | null;

function dateFromValue(value: string) {
  return value ? new Date(`${value}T12:00:00`) : new Date();
}

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function label(value: string, fallback: string) {
  return value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : fallback;
}

export function DateRangePicker({ from, to, onChange }: { from: string; to: string; onChange: (from: string, to: string) => void }) {
  const [selecting, setSelecting] = useState<Selecting>(null);

  const choose = (_event: DateTimePickerChangeEvent, selected: Date) => {
    if (!selecting) return;

    const next = toDateValue(selected);
    if (selecting === "from") onChange(next, to && to < next ? next : to);
    else onChange(from && from > next ? next : from, next);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Choose date range</Text>
      <View style={styles.row}>
        <Pressable style={[styles.dateButton, selecting === "from" && styles.selected]} onPress={() => setSelecting("from")}>
          <CalendarDays size={17} color={colors.glow} />
          <View><Text style={styles.caption}>FROM</Text><Text style={styles.value}>{label(from, "Select date")}</Text></View>
        </Pressable>
        <Pressable style={[styles.dateButton, selecting === "to" && styles.selected]} onPress={() => setSelecting("to")}>
          <CalendarDays size={17} color={colors.glow} />
          <View><Text style={styles.caption}>TO</Text><Text style={styles.value}>{label(to, "Select date")}</Text></View>
        </Pressable>
      </View>
      {selecting && (
        <View style={Platform.OS === "ios" ? styles.iosPicker : undefined}>
          <DateTimePicker
            value={dateFromValue(selecting === "from" ? from : to)}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            maximumDate={new Date()}
            onValueChange={choose}
            onDismiss={() => Platform.OS !== "ios" && setSelecting(null)}
            themeVariant="dark"
          />
        </View>
      )}
    </View>
  );
}

export function DatePickerField({ label: fieldLabel, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const choose = (_event: DateTimePickerChangeEvent, selected: Date) => {
    onChange(toDateValue(selected));
  };

  return (
    <View style={styles.singleWrap}>
      <Text style={styles.heading}>{fieldLabel}</Text>
      <Pressable style={[styles.dateButton, styles.singleButton, open && styles.selected]} onPress={() => setOpen(true)}>
        <CalendarDays size={18} color={colors.glow} />
        <Text style={styles.singleValue}>{label(value, "Select date")}</Text>
      </Pressable>
      {open && (
        <View style={Platform.OS === "ios" ? styles.iosPicker : undefined}>
          <DateTimePicker value={dateFromValue(value)} mode="date" display={Platform.OS === "ios" ? "inline" : "default"} maximumDate={new Date()} onValueChange={choose} onDismiss={() => Platform.OS !== "ios" && setOpen(false)} themeVariant="dark" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  heading: { marginBottom: 8, color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  row: { flexDirection: "row", gap: 8 },
  dateButton: { flex: 1, minHeight: 62, flexDirection: "row", alignItems: "center", gap: 9, borderRadius: radii.input, borderWidth: 1, borderColor: colors.glassBorder, backgroundColor: colors.ghostBg, paddingHorizontal: 11 },
  selected: { borderColor: colors.glow, backgroundColor: colors.glowFaint },
  caption: { color: colors.textFaint, fontSize: 9.5, fontWeight: "800", letterSpacing: 0.8 },
  value: { marginTop: 3, color: colors.text, fontSize: 12, fontWeight: "700" },
  iosPicker: { marginTop: 10, borderRadius: radii.card, overflow: "hidden", backgroundColor: colors.navyCard },
  singleWrap: { marginBottom: 14 },
  singleButton: { flex: 0, width: "100%" },
  singleValue: { color: colors.text, fontSize: 14, fontWeight: "700" },
});
