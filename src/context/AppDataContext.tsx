import React, { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type {
  DashboardSummary,
  Transaction,
  TransactionCategory,
  TransactionType,
  User,
  Vehicle,
  VehicleType,
} from "../types/domain";

let idSeed = 100;
const nextId = () => String(idSeed++);

const seedVehicles: Vehicle[] = [
  { id: "1", vehicleNumber: "BR05 AB 1234", vehicleType: "Truck" },
  { id: "2", vehicleNumber: "BR01 PQ 7788", vehicleType: "Bus" },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const seedTransactions: Transaction[] = [
  { id: "t1", vehicleId: "1", vehicleNumber: "BR05 AB 1234", type: "Income", category: "Trip", amount: 8500, date: daysAgo(0), note: "Patna trip" },
  { id: "t2", vehicleId: "1", vehicleNumber: "BR05 AB 1234", type: "Expense", category: "Diesel", amount: 2200, date: daysAgo(0) },
  { id: "t3", vehicleId: "1", vehicleNumber: "BR05 AB 1234", type: "Expense", category: "Toll", amount: 450, date: daysAgo(1) },
  { id: "t4", vehicleId: "2", vehicleNumber: "BR01 PQ 7788", type: "Income", category: "Trip", amount: 6200, date: daysAgo(1) },
  { id: "t5", vehicleId: "2", vehicleNumber: "BR01 PQ 7788", type: "Expense", category: "Driver", amount: 1000, date: daysAgo(2) },
  { id: "t6", vehicleId: "1", vehicleNumber: "BR05 AB 1234", type: "Income", category: "Trip", amount: 9100, date: daysAgo(6) },
  { id: "t7", vehicleId: "1", vehicleNumber: "BR05 AB 1234", type: "Expense", category: "Maintenance", amount: 3200, date: daysAgo(10) },
  { id: "t8", vehicleId: "2", vehicleNumber: "BR01 PQ 7788", type: "Expense", category: "Food", amount: 350, date: daysAgo(15) },
];

interface AppDataContextValue {
  user: User | null;
  login: (phone: string) => void;
  register: (name: string, phone: string) => void;
  logout: () => void;

  vehicles: Vehicle[];
  addVehicle: (vehicleNumber: string, vehicleType: VehicleType) => void;
  updateVehicle: (id: string, vehicleNumber: string, vehicleType: VehicleType) => void;
  removeVehicle: (id: string) => void;

  transactions: Transaction[];
  addTransaction: (input: {
    vehicleId: string;
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    date: string;
    note?: string;
  }) => void;
  updateTransaction: (
    id: string,
    input: { category: TransactionCategory; amount: number; date: string; note?: string }
  ) => void;
  removeTransaction: (id: string) => void;

  dashboardToday: DashboardSummary;
  dashboardMonth: DashboardSummary;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function isSameDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return d.toDateString() === ref.toDateString();
}

function isSameMonth(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

function summarize(vehicles: Vehicle[], txns: Transaction[]): DashboardSummary {
  let totalIncome = 0;
  let totalExpense = 0;
  const byVehicle: Record<string, { income: number; expense: number }> = {};
  vehicles.forEach((v) => (byVehicle[v.id] = { income: 0, expense: 0 }));

  txns.forEach((t) => {
    if (!byVehicle[t.vehicleId]) byVehicle[t.vehicleId] = { income: 0, expense: 0 };
    if (t.type === "Income") {
      totalIncome += t.amount;
      byVehicle[t.vehicleId].income += t.amount;
    } else {
      totalExpense += t.amount;
      byVehicle[t.vehicleId].expense += t.amount;
    }
  });

  return {
    totalIncome,
    totalExpense,
    totalProfit: totalIncome - totalExpense,
    vehicles: vehicles.map((v) => ({
      vehicleId: v.id,
      vehicleNumber: v.vehicleNumber,
      vehicleType: v.vehicleType,
      income: byVehicle[v.id]?.income ?? 0,
      expense: byVehicle[v.id]?.expense ?? 0,
      profit: (byVehicle[v.id]?.income ?? 0) - (byVehicle[v.id]?.expense ?? 0),
    })),
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // "Log in" to the demo account — pre-loaded with sample vehicles/transactions
  // so the Dashboard/Reports/History screens have something to show.
  const login = (phone: string) => {
    setUser({ name: "Rajesh Kumar", phone: phone || "98765 43210" });
    setVehicles(seedVehicles);
    setTransactions(seedTransactions);
  };

  // "Create an account" — a brand new account has no vehicles or transactions
  // yet, and uses whatever name/phone the person actually typed in.
  const register = (name: string, phone: string) => {
    setUser({ name: name.trim() || "Driver", phone: phone.trim() || "—" });
    setVehicles([]);
    setTransactions([]);
  };

  const logout = () => setUser(null);

  const addVehicle = (vehicleNumber: string, vehicleType: VehicleType) =>
    setVehicles((prev) => [...prev, { id: nextId(), vehicleNumber, vehicleType }]);

  const updateVehicle = (id: string, vehicleNumber: string, vehicleType: VehicleType) =>
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, vehicleNumber, vehicleType } : v)));

  const removeVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    setTransactions((prev) => prev.filter((t) => t.vehicleId !== id));
  };

  const addTransaction: AppDataContextValue["addTransaction"] = (input) => {
    const vehicle = vehicles.find((v) => v.id === input.vehicleId);
    setTransactions((prev) => [
      {
        id: nextId(),
        vehicleId: input.vehicleId,
        vehicleNumber: vehicle?.vehicleNumber ?? "",
        type: input.type,
        category: input.category,
        amount: input.amount,
        date: input.date,
        note: input.note,
      },
      ...prev,
    ]);
  };

  const updateTransaction: AppDataContextValue["updateTransaction"] = (id, input) =>
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, category: input.category, amount: input.amount, date: input.date, note: input.note }
          : t
      )
    );

  const removeTransaction = (id: string) => setTransactions((prev) => prev.filter((t) => t.id !== id));

  const dashboardToday = useMemo(() => {
    const now = new Date();
    return summarize(vehicles, transactions.filter((t) => isSameDay(t.date, now)));
  }, [vehicles, transactions]);

  const dashboardMonth = useMemo(() => {
    const now = new Date();
    return summarize(vehicles, transactions.filter((t) => isSameMonth(t.date, now)));
  }, [vehicles, transactions]);

  const value: AppDataContextValue = {
    user,
    login,
    register,
    logout,
    vehicles,
    addVehicle,
    updateVehicle,
    removeVehicle,
    transactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    dashboardToday,
    dashboardMonth,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
