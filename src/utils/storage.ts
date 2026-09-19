import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEY = "vpt_auth";

export type StoredAuth = {
  accessToken: string;
  refreshToken: string;
  user: Record<string, any> | null;
};

export async function saveAuth(auth: StoredAuth) {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export async function getAuth(): Promise<StoredAuth | null> {
  const value = await AsyncStorage.getItem(AUTH_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value) as StoredAuth;
  } catch {
    return null;
  }
}

export async function clearAuth() {
  await AsyncStorage.removeItem(AUTH_KEY);
}
