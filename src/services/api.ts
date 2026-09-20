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

// Allows AppDataContext to plug in a refresh handler without api.ts needing
// to know about React state, SecureStore, or the shape of stored auth.
// Set once, at app startup, from AppDataContext.
let onUnauthorized: (() => Promise<string | null>) | null = null;
export function setUnauthorizedHandler(handler: (() => Promise<string | null>) | null) {
  onUnauthorized = handler;
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

  // Don't try to refresh on the auth endpoints themselves — a 401 there means
  // the credentials/refresh token are actually invalid, not merely expired.
  const isAuthEndpoint = path.includes("/auth/login") || path.includes("/auth/refresh") || path.includes("/auth/register");

  if (response.status === 401 && token && onUnauthorized && !isAuthEndpoint) {
    const newToken = await onUnauthorized();
    if (newToken) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
      const retryResponse = await fetch(buildUrl(path), { ...options, headers: retryHeaders });
      const retryData = await getJsonBody(retryResponse);
      if (!retryResponse.ok) {
        const message = typeof retryData === "string" ? retryData : retryData?.message || retryData?.error || "Request failed";
        throw new Error(message || "Request failed");
      }
      return retryData as T;
    }
  }

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

export async function forgotPassword(phone: string) {
  return apiRequest<{ message?: string }>(
    "/api/v1/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({ phone }),
    }
  );
}

export async function resetPassword(phone: string, token: string, newPassword: string) {
  return apiRequest<{ message?: string }>(
    "/api/v1/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify({ phone, token, newPassword }),
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

export async function updateVehicle(id: string, vehicleNumber: string, vehicleType: string, token: string) {
  return apiRequest<{ id?: string; vehicleNumber?: string; vehicleType?: string }>(
    `/api/v1/vehicles/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({ vehicleNumber, vehicleType }),
    },
    token
  );
}

export async function deleteVehicle(id: string, token: string) {
  return apiRequest<void>(`/api/v1/vehicles/${id}`, { method: "DELETE" }, token);
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

export async function updateTransaction(
  id: string,
  payload: { type: string; category: string; amount: number; date: string; note?: string },
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
    `/api/v1/transactions/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token
  );
}

export async function deleteTransaction(id: string, token: string) {
  return apiRequest<void>(`/api/v1/transactions/${id}`, { method: "DELETE" }, token);
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