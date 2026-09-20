import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  DashboardSummary,
  Transaction,
  TransactionCategory,
  TransactionType,
  User,
  Vehicle,
  VehicleType,
} from "../types/domain";
import { clearAuth, getAuth, saveAuth } from "../utils/storage";
import {
  createTransaction,
  createVehicle,
  deleteTransaction as apiDeleteTransaction,
  deleteVehicle as apiDeleteVehicle,
  forgotPassword as apiForgotPassword,
  getDashboardMonth,
  getDashboardToday,
  getTransactions,
  getVehicles,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword as apiResetPassword,
  setUnauthorizedHandler,
  updateTransaction as apiUpdateTransaction,
  updateVehicle as apiUpdateVehicle,
} from "../services/api";

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
  accessToken: string | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  vehicles: Vehicle[];
  addVehicle: (vehicleNumber: string, vehicleType: VehicleType) => Promise<void>;
  updateVehicle: (id: string, vehicleNumber: string, vehicleType: VehicleType) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;

  transactions: Transaction[];
  addTransaction: (input: {
    vehicleId: string;
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    date: string;
    note?: string;
  }) => Promise<void>;
  updateTransaction: (
    id: string,
    input: { category: TransactionCategory; amount: number; date: string; note?: string }
  ) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;

  dashboardToday: DashboardSummary;
  dashboardMonth: DashboardSummary;

  forgotPassword: (phone: string) => Promise<void>;
  resetPassword: (phone: string, token: string, newPassword: string) => Promise<void>;
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [remoteDashboardToday, setRemoteDashboardToday] = useState<DashboardSummary | null>(null);
  const [remoteDashboardMonth, setRemoteDashboardMonth] = useState<DashboardSummary | null>(null);

  const extractList = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.result)) return data.result;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.value)) return data.value;
    if (Array.isArray(data?.vehicles)) return data.vehicles;
    if (Array.isArray(data?.transactions)) return data.transactions;
    return [];
  };

  const normalizeVehicles = (data: any): Vehicle[] => {
    const list = extractList(data);

    return list
      .map((item: any) => ({
        id: item?.id ?? item?.vehicleId ?? String(item?.vehicleNumber ?? ""),
        vehicleNumber: item?.vehicleNumber ?? item?.number ?? item?.name ?? "",
        vehicleType: (item?.vehicleType ?? item?.type ?? "Truck") as VehicleType,
      }))
      .filter((item: Vehicle) => item.vehicleNumber);
  };

  const normalizeTransactions = (data: any): Transaction[] => {
    const list = extractList(data);

    return list
      .map((item: any) => ({
        id: item?.id ?? item?.transactionId ?? `${item?.vehicleId ?? "tx"}-${item?.date ?? Date.now()}`,
        vehicleId: item?.vehicleId ?? item?.vehicle?.id ?? item?.vehicleId ?? "",
        vehicleNumber: item?.vehicleNumber ?? item?.vehicle?.vehicleNumber ?? "",
        type: (item?.type ?? "Expense") as TransactionType,
        category: (item?.category ?? "Other") as TransactionCategory,
        amount: Number(item?.amount ?? 0),
        date: item?.date ?? new Date().toISOString(),
        note: item?.note ?? "",
      }))
      .filter((item: Transaction) => item.vehicleId || item.vehicleNumber);
  };

  const loadUserData = async (token: string) => {
    try {
      const [vehicleList, transactionList, todayRes, monthRes] = await Promise.all([
        getVehicles(token).catch(() => []),
        getTransactions(token).catch(() => []),
        getDashboardToday(token).catch(() => null),
        getDashboardMonth(token).catch(() => null),
      ]);

      const normalizedVehicles = normalizeVehicles(vehicleList);
      const normalizedTransactions = normalizeTransactions(transactionList);
      setVehicles(normalizedVehicles);
      setTransactions(normalizedTransactions);

      const normSummary = (summary: any): DashboardSummary | null => {
        if (!summary) return null;
        const payload = summary?.data && typeof summary.data === "object" && !Array.isArray(summary.data) ? summary.data : summary;
        const vehicleList = extractList(payload?.vehicles ?? payload?.items ?? payload?.data ?? []);
        const totalIncome = Number(payload?.totalIncome ?? payload?.income ?? 0);
        const totalExpense = Number(payload?.totalExpense ?? payload?.expense ?? 0);
        const totalProfit = Number(payload?.totalProfit ?? payload?.profit ?? totalIncome - totalExpense);

        return {
          totalIncome,
          totalExpense,
          totalProfit,
          vehicles:
            vehicleList.map((item: any) => ({
              vehicleId: item?.vehicleId ?? item?.id ?? "",
              vehicleNumber: item?.vehicleNumber ?? item?.number ?? item?.name ?? "",
              vehicleType: normalizedVehicles.find((v) => v.id === (item?.vehicleId ?? item?.id))?.vehicleType ?? "Truck",
              income: Number(item?.income ?? 0),
              expense: Number(item?.expense ?? 0),
              profit: Number(item?.profit ?? (Number(item?.income ?? 0) - Number(item?.expense ?? 0))),
            })) ?? [],
        };
      };

      const mappedToday: DashboardSummary | null = normSummary(todayRes);
      const mappedMonth: DashboardSummary | null = normSummary(monthRes);

      setRemoteDashboardToday(mappedToday);
      setRemoteDashboardMonth(mappedMonth);
    } catch {
      // Only clear state if all primary data fetches fail. A single dashboard summary error should not wipe real vehicles/transactions.
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      const auth = await getAuth();
      if (!auth?.accessToken || !auth?.user) return;

      setAccessToken(auth.accessToken);
      setRefreshToken(auth.refreshToken || null);
      setUser({
        name: auth.user.name || auth.user.fullName || "User",
        phone: auth.user.phone || auth.user.mobile || "",
      });
      await loadUserData(auth.accessToken);
    };

    restoreSession();
  }, []);

  // Keep a ref in sync with the latest refreshToken so the unauthorized-handler
  // (registered once below) always reads the current value, not a stale closure.
  const refreshTokenRef = React.useRef<string | null>(null);
  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  useEffect(() => {
    // Called by api.ts whenever any authenticated request gets a 401.
    // Tries to silently get a new access token using the stored refresh token.
    // Returns the new token on success (so the failed request can be retried),
    // or null on failure (so the caller logs the user out instead).
    setUnauthorizedHandler(async () => {
      const currentRefreshToken = refreshTokenRef.current;
      if (!currentRefreshToken) return null;

      try {
        const response = await refreshAccessToken(currentRefreshToken);
        const newAccessToken = response.accessToken || response.token;
        const newRefreshToken = response.refreshToken || currentRefreshToken;
        if (!newAccessToken) return null;

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        const auth = await getAuth();
        await saveAuth({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: auth?.user || null,
        });
        return newAccessToken;
      } catch {
        // Refresh token itself is invalid/expired — log the user out cleanly
        // rather than leaving them in a half-authenticated state.
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        setVehicles([]);
        setTransactions([]);
        await clearAuth();
        return null;
      }
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  const persistAuth = async (nextAccessToken: string, nextRefreshToken: string, nextUser: any) => {
    setAccessToken(nextAccessToken);
    setRefreshToken(nextRefreshToken);
    setUser({
      name: nextUser?.name || nextUser?.fullName || "User",
      phone: nextUser?.phone || nextUser?.mobile || "",
    });

    await saveAuth({
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
      user: nextUser || null,
    });
  };

  const login = async (phone: string, password: string) => {
    const response = await loginUser(phone.trim(), password);
    const nextAccessToken = response.accessToken || response.token;
    const nextRefreshToken = response.refreshToken || "";
    const nextUser = response.user || {
      name: response.name || "User",
      phone: response.phone || phone.trim(),
    };

    if (!nextAccessToken) {
      throw new Error(response.message || "Login failed");
    }

    await persistAuth(nextAccessToken, nextRefreshToken, nextUser);
    await loadUserData(nextAccessToken);
  };

  const register = async (name: string, phone: string, password: string) => {
    const response = await registerUser(name.trim(), phone.trim(), password);

    if (response.message) {
      throw new Error(response.message);
    }

    if (response.id || response.name || response.phone) {
      setUser({
        name: response.name || name.trim() || "User",
        phone: response.phone || phone.trim(),
      });
    }

    setVehicles([]);
    setTransactions([]);
  };

  const logout = async () => {
    if (refreshToken) {
      try {
        await logoutUser(refreshToken);
      } catch {}
    }

    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setVehicles([]);
    setTransactions([]);
    await clearAuth();
  };

  const addVehicle = async (vehicleNumber: string, vehicleType: VehicleType) => {
    if (accessToken) {
      try {
        const created = await createVehicle(vehicleNumber, vehicleType, accessToken);
        const normalized: Vehicle = {
          id: created.id ?? nextId(),
          vehicleNumber: created.vehicleNumber ?? vehicleNumber,
          vehicleType: (created.vehicleType ?? vehicleType) as VehicleType,
        };
        setVehicles((prev) => [...prev, normalized]);
        return;
      } catch {
        // Fall back to local update if the backend is temporarily unavailable.
      }
    }

    setVehicles((prev) => [...prev, { id: nextId(), vehicleNumber, vehicleType }]);
  };

  const updateVehicle = async (id: string, vehicleNumber: string, vehicleType: VehicleType) => {
    if (accessToken) {
      try {
        await apiUpdateVehicle(id, vehicleNumber, vehicleType, accessToken);
      } catch {
        // Fall back to local-only update if the backend call fails; the next
        // successful sync from the server will reconcile the real state.
      }
    }
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, vehicleNumber, vehicleType } : v)));
  };

  const removeVehicle = async (id: string) => {
    if (accessToken) {
      try {
        await apiDeleteVehicle(id, accessToken);
      } catch {
        // Fall back to local-only removal if the backend call fails.
      }
    }
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    setTransactions((prev) => prev.filter((t) => t.vehicleId !== id));
    setRemoteDashboardToday(null);
    setRemoteDashboardMonth(null);
  };

  const addTransaction: AppDataContextValue["addTransaction"] = async (input) => {
    if (accessToken) {
      try {
        const created = await createTransaction(
          {
            vehicleId: input.vehicleId,
            type: input.type,
            category: input.category,
            amount: input.amount,
            date: input.date,
            note: input.note,
          },
          accessToken
        );

        const vehicle = vehicles.find((v) => v.id === input.vehicleId);
        const normalized: Transaction = {
          id: created.id ?? nextId(),
          vehicleId: created.vehicleId ?? input.vehicleId,
          vehicleNumber: created.vehicleNumber ?? vehicle?.vehicleNumber ?? "",
          type: (created.type ?? input.type) as TransactionType,
          category: (created.category ?? input.category) as TransactionCategory,
          amount: Number(created.amount ?? input.amount ?? 0),
          date: created.date ?? input.date,
          note: created.note ?? input.note,
        };

        setTransactions((prev) => [normalized, ...prev]);
        setRemoteDashboardToday(null);
        setRemoteDashboardMonth(null);
        return;
      } catch {
        // Fall back to local update if backend request fails.
      }
    }

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
    setRemoteDashboardToday(null);
    setRemoteDashboardMonth(null);
  };

  const updateTransaction: AppDataContextValue["updateTransaction"] = async (id, input) => {
    if (accessToken) {
      try {
        const existing = transactions.find((t) => t.id === id);
        await apiUpdateTransaction(
          id,
          {
            type: existing?.type ?? "Expense",
            category: input.category,
            amount: input.amount,
            date: input.date,
            note: input.note,
          },
          accessToken
        );
      } catch {
        // Fall back to local-only update if the backend call fails.
      }
    }
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, category: input.category, amount: input.amount, date: input.date, note: input.note }
          : t
      )
    );
    setRemoteDashboardToday(null);
    setRemoteDashboardMonth(null);
  };

  const removeTransaction = async (id: string) => {
    if (accessToken) {
      try {
        await apiDeleteTransaction(id, accessToken);
      } catch {
        // Fall back to local-only removal if the backend call fails.
      }
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setRemoteDashboardToday(null);
    setRemoteDashboardMonth(null);
  };

  const forgotPassword = async (phone: string) => {
    // apiRequest throws automatically on a non-2xx response, so reaching this
    // line means the backend accepted the request and (if the phone is
    // registered) queued a reset code.
    await apiForgotPassword(phone.trim());
  };

  const resetPassword = async (phone: string, token: string, newPassword: string) => {
    await apiResetPassword(phone.trim(), token.trim(), newPassword);
  };

  const dashboardToday = useMemo(() => {
    if (remoteDashboardToday) return remoteDashboardToday;
    const now = new Date();
    return summarize(vehicles, transactions.filter((t) => isSameDay(t.date, now)));
  }, [remoteDashboardToday, vehicles, transactions]);

  const dashboardMonth = useMemo(() => {
    if (remoteDashboardMonth) return remoteDashboardMonth;
    const now = new Date();
    return summarize(vehicles, transactions.filter((t) => isSameMonth(t.date, now)));
  }, [remoteDashboardMonth, vehicles, transactions]);

  const value: AppDataContextValue = {
    user,
    accessToken,
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
    forgotPassword,
    resetPassword,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}