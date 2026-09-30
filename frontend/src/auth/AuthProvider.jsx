import { useCallback, useMemo, useState } from "react";
import * as api from "../api";
import { AuthContext } from "./context";

const STORAGE_KEY = "book-reviews-auth";


const tokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp * 1000;
  } catch {
    return 0;
  }
};

const loadSession = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved?.token && tokenExpiry(saved.token) > Date.now() ? saved : null;
  } catch {
    return null;
  }
};

const saveSession = (session) => {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable: the session just won't survive a reload
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  const logout = useCallback(() => {
    saveSession(null);
    setSession(null);
  }, []);

  const login = useCallback(async (username, password) => {
    const { token } = await api.login(username, password);
    const next = { token, username };
    saveSession(next);
    setSession(next);
  }, []);

  const register = useCallback(
    async (username, password) => {
      await api.register(username, password);
      await login(username, password);
    },
    [login],
  );

  const value = useMemo(
    () => ({
      user: session ? { username: session.username } : null,
      token: session?.token ?? null,
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

