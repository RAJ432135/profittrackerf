import type { Transaction } from "../types/domain";

export type PeriodKey = "today" | "week" | "month" | "lastMonth" | "year" | "all" | "custom";

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  lastMonth: "Last month",
  year: "This year",
  all: "All time",
  custom: "Custom",
};

export function resolvePeriod(period: PeriodKey, customFrom?: string, customTo?: string): { from?: Date; to?: Date } {
  const now = new Date();
  switch (period) {
    case "today": {
      const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      return { from, to };
    }
    case "week": {
      const day = now.getDay();
      const from = new Date(now);
      from.setDate(now.getDate() - day);
      from.setHours(0, 0, 0, 0);
      return { from, to: now };
    }
    case "month": {
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
    }
    case "lastMonth": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { from, to };
    }
    case "year": {
      return { from: new Date(now.getFullYear(), 0, 1), to: now };
    }
    case "custom": {
      return {
        from: customFrom ? new Date(customFrom) : undefined,
        to: customTo ? new Date(customTo) : undefined,
      };
    }
    case "all":
    default:
      return {};
  }
}

export function totalsFor(transactions: Transaction[]) {
  let income = 0;
  let expense = 0;
  let tripCount = 0;
  transactions.forEach((t) => {
    if (t.type === "Income") {
      income += t.amount;
      if (t.category === "Trip") tripCount += 1;
    } else {
      expense += t.amount;
    }
  });
  return { income, expense, profit: income - expense, tripCount, transactionCount: transactions.length };
}

export function inRange(t: Transaction, from?: Date, to?: Date): boolean {
  const d = new Date(t.date);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}
