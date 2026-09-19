export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "https://profittrackerb-production.up.railway.app").replace(/\/+$/, "");

function buildUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function getJsonBody(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => ({}));
  }
  return response.text().catch(() => "");
}

export async function apiRequest<T = any>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  } as Record<string, string>;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  const data = await getJsonBody(response);

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.error || "Request failed";
    throw new Error(message || "Request failed");
  }

  return data as T;
}

export async function registerUser(name: string, phone: string, password: string) {
  return apiRequest<{
    id?: string;
    name?: string;
    phone?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: any;
    token?: string;
    message?: string;
  }>(
    "/api/v1/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ name, phone, password }),
    }
  );
}

export async function loginUser(phone: string, password: string) {
  return apiRequest<{
    accessToken?: string;
    refreshToken?: string;
    user?: any;
    token?: string;
    name?: string;
    phone?: string;
    message?: string;
  }>(
    "/api/v1/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ phone, password, rememberMe: false }),
    }
  );
}

export async function refreshAccessToken(refreshToken: string) {
  return apiRequest<{ accessToken?: string; refreshToken?: string; token?: string }>(
    "/api/v1/auth/refresh",
    {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }
  );
}

export async function logoutUser(refreshToken: string) {
  return apiRequest<{ message?: string }>(
    "/api/v1/auth/logout",
    {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }
  );
}

export async function createVehicle(vehicleNumber: string, vehicleType: string, token: string) {
  return apiRequest<{ id?: string; vehicleNumber?: string; vehicleType?: string; createdAt?: string }>(
    "/api/v1/vehicles",
    {
      method: "POST",
      body: JSON.stringify({ vehicleNumber, vehicleType }),
    },
    token
  );
}

export async function getVehicles(token: string) {
  return apiRequest<any[]>("/api/v1/vehicles", { method: "GET" }, token);
}

export async function createTransaction(
  payload: {
    vehicleId: string;
    type: "Income" | "Expense";
    category: string;
    amount: number;
    date: string;
    note?: string;
  },
  token: string
) {
  return apiRequest<{
    id?: string;
    vehicleId?: string;
    vehicleNumber?: string;
    type?: string;
    category?: string;
    amount?: number;
    date?: string;
    note?: string;
  }>(
    "/api/v1/transactions",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

export async function getTransactions(token: string) {
  return apiRequest<any[]>("/api/v1/transactions", { method: "GET" }, token);
}

export async function getDashboardToday(token: string) {
  return apiRequest<{
    totalIncome?: number;
    totalExpense?: number;
    totalProfit?: number;
    vehicles?: Array<{
      vehicleId?: string;
      vehicleNumber?: string;
      income?: number;
      expense?: number;
      profit?: number;
    }>;
  }>("/api/v1/dashboard/today", { method: "GET" }, token);
}

export async function getDashboardWeek(token: string) {
  return apiRequest<{
    period?: string;
    startDate?: string;
    endDate?: string;
    totalIncome?: number;
    totalExpense?: number;
    totalProfit?: number;
    vehicles?: Array<{
      vehicleId?: string;
      vehicleNumber?: string;
      income?: number;
      expense?: number;
      profit?: number;
    }>;
  }>("/api/v1/dashboard/week", { method: "GET" }, token);
}

export async function getDashboardMonth(token: string) {
  return apiRequest<{
    totalIncome?: number;
    totalExpense?: number;
    totalProfit?: number;
    vehicles?: Array<{
      vehicleId?: string;
      vehicleNumber?: string;
      income?: number;
      expense?: number;
      profit?: number;
    }>;
  }>("/api/v1/dashboard/month", { method: "GET" }, token);
}
export async function getDashboardLastMonth(token: string) {
  return apiRequest<{
    period?: string;
    startDate?: string;
    endDate?: string;
    totalIncome?: number;
    totalExpense?: number;
    totalProfit?: number;
    vehicles?: Array<{
      vehicleId?: string;
      vehicleNumber?: string;
      income?: number;
      expense?: number;
      profit?: number;
    }>;
  }>("/api/v1/dashboard/last-month", { method: "GET" }, token);
}

export async function getDashboardYear(token: string, year?: number | string) {
  const qs = year ? `?year=${encodeURIComponent(String(year))}` : "";
  return apiRequest<{
    period?: string;
    startDate?: string;
    endDate?: string;
    totalIncome?: number;
    totalExpense?: number;
    totalProfit?: number;
    vehicles?: Array<{
      vehicleId?: string;
      vehicleNumber?: string;
      income?: number;
      expense?: number;
      profit?: number;
    }>;
  }>(`/api/v1/dashboard/year${qs}`, { method: "GET" }, token);
}

export async function getDashboardRange(token: string, fromDate: string, toDate: string) {
  const params = new URLSearchParams({
    fromDate,
    toDate,
  });

  return apiRequest<{
    period?: string;
    startDate?: string;
    endDate?: string;
    totalIncome?: number;
    totalExpense?: number;
    totalProfit?: number;
    vehicles?: Array<{
      vehicleId?: string;
      vehicleNumber?: string;
      income?: number;
      expense?: number;
      profit?: number;
    }>;
  }>(`/api/v1/dashboard/range?${params.toString()}`, { method: "GET" }, token);
}
export async function getProfile(token: string) {
  return apiRequest<any>("/api/v1/profile", { method: "GET" }, token);
}
