import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_URL } from "../services/api";

const AuthContext = createContext(null);
const USER_KEY = "campustracker:user";
const TOKEN_KEY = "campustracker:token";

export function dashboardForRole(role) {
  if (role === "teacher") return "/teacher-dashboard";
  if (role === "admin") return "/admin-dashboard";
  return "/student-dashboard";
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || data.errors?.[0]?.msg || "Request failed");
  }
  return data;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authChecked, setAuthChecked] = useState(false);

  const persistAuth = (nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    async function verify() {
      if (!token) {
        setAuthChecked(true);
        return;
      }
      try {
        const data = await request("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        const nextUser = data.data || data.user;
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      } catch {
        clearAuth();
      } finally {
        setAuthChecked(true);
      }
    }
    verify();
  }, [token]);

  const login = async ({ email, password, role }) => {
    const data = await request("/auth/login", { method: "POST", body: JSON.stringify({ email, password, role }) });
    persistAuth(data.token, data.user);
    return { ok: true, user: data.user, redirectTo: dashboardForRole(data.user.role) };
  };

  const register = async (payload) => {
    const data = await request("/auth/send-registration-otp", { method: "POST", body: JSON.stringify(payload) });
    return { ok: true, email: data.data?.email || payload.email };
  };

  const verifyOtp = async ({ email, otp }) => {
    await request("/auth/verify-registration-otp", { method: "POST", body: JSON.stringify({ email, otp }) });
    return { ok: true };
  };

  const resendOtp = async ({ email }) => {
    await request("/auth/resend-registration-otp", { method: "POST", body: JSON.stringify({ email }) });
    return { ok: true };
  };

  const logout = async () => {
    try {
      if (token) await request("/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    } catch {
      // Local logout still wins.
    }
    clearAuth();
  };

  const value = useMemo(() => ({
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(token && user),
    authChecked,
    login,
    logout,
    register,
    verifyOtp,
    resendOtp,
  }), [authChecked, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
