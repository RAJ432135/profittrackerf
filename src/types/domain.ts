export type TransactionType = "Income" | "Expense";

export type TransactionCategory =
  // Vehicle-side
  | "Trip"
  | "Diesel"
  | "Toll"
  | "Driver"
  // Shop-side
  | "Sale"
  | "Rent"
  | "Stock"
  | "Staff"
  | "Electricity"
  // Shared
  | "Maintenance"
  | "Food"
  | "Other";

// A "unit" is whatever the owner is tracking profit for — a vehicle (truck,
// bus...) or a shop/branch. Same app, same screens; only the label, icon,
// and category list change based on which type is picked.
export type VehicleType = "Truck" | "Bus" | "MiniTruck" | "Pickup" | "Other" | "Shop" | "Branch" | "ShopOther";

// The top-level choice, shown first and given equal visual weight — this is
// what makes the app read as "built for both", not "vehicles, plus a Shop
// option bolted on the end".
export type BusinessType = "Vehicle" | "Shop";

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  Vehicle: "Vehicle",
  Shop: "Shop",
};

export const VEHICLE_SUBTYPES: VehicleType[] = ["Truck", "Bus", "MiniTruck", "Pickup", "Other"];
export const SHOP_SUBTYPES: VehicleType[] = ["Shop", "Branch", "ShopOther"];

export const VEHICLE_TYPES: VehicleType[] = [...VEHICLE_SUBTYPES, ...SHOP_SUBTYPES];

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  Truck: "Truck",
  Bus: "Bus",
  MiniTruck: "Mini truck",
  Pickup: "Pickup",
  Other: "Other",
  Shop: "Shop",
  Branch: "Branch",
  ShopOther: "Other",
};

// Is this unit type a shop/branch, or a vehicle? Used to pick the right
// icon, the right field label ("Shop name" vs "Vehicle number"), and the
// right category list for Add/Edit transaction.
export function isShopType(type: VehicleType): boolean {
  return type === "Shop" || type === "Branch" || type === "ShopOther";
}

export function businessTypeOf(type: VehicleType): BusinessType {
  return isShopType(type) ? "Shop" : "Vehicle";
}

export function subtypesFor(business: BusinessType): VehicleType[] {
  return business === "Shop" ? SHOP_SUBTYPES : VEHICLE_SUBTYPES;
}

const VEHICLE_INCOME_CATEGORIES: TransactionCategory[] = ["Trip"];
const VEHICLE_EXPENSE_CATEGORIES: TransactionCategory[] = ["Diesel", "Toll", "Driver", "Maintenance", "Food", "Other"];

const SHOP_INCOME_CATEGORIES: TransactionCategory[] = ["Sale"];
const SHOP_EXPENSE_CATEGORIES: TransactionCategory[] = ["Rent", "Stock", "Staff", "Electricity", "Maintenance", "Food", "Other"];

// Backward-compatible names — used wherever "the whole list, regardless of
// unit type" is needed (e.g. History's category filter).
export const INCOME_CATEGORIES: TransactionCategory[] = ["Trip", "Sale"];
export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  "Diesel",
  "Toll",
  "Driver",
  "Rent",
  "Stock",
  "Staff",
  "Electricity",
  "Maintenance",
  "Food",
  "Other",
];

/** The income/expense categories relevant to one specific unit (vehicle vs shop). */
export function categoriesForUnitType(type: VehicleType): {
  income: TransactionCategory[];
  expense: TransactionCategory[];
} {
  if (isShopType(type)) {
    return { income: SHOP_INCOME_CATEGORIES, expense: SHOP_EXPENSE_CATEGORIES };
  }
  return { income: VEHICLE_INCOME_CATEGORIES, expense: VEHICLE_EXPENSE_CATEGORIES };
}

/** "Vehicle number" for a truck/bus, "Shop name" for a shop/branch. */
export function unitNameLabel(type: VehicleType): string {
  return isShopType(type) ? "Shop / branch name" : "Vehicle number";
}

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  Trip: "Trip",
  Diesel: "Diesel",
  Toll: "Toll",
  Driver: "Driver",
  Sale: "Sale",
  Rent: "Rent",
  Stock: "Stock",
  Staff: "Staff",
  Electricity: "Electricity",
  Maintenance: "Maintenance",
  Food: "Food",
  Other: "Other",
};

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
}

export interface Transaction {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  date: string; // ISO
  note?: string;
}

export interface VehicleSummary {
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  income: number;
  expense: number;
  profit: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  totalProfit: number;
  vehicles: VehicleSummary[];
}

export interface User {
  name: string;
  phone: string;
}
