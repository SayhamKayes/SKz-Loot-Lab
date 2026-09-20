import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  registerUserFn,
  loginUserFn,
  verifyUserTokenFn,
  updateUserProfileFn,
  adminLoginFn,
  adminVerifyFn,
} from "@/api";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (params: {
    name: string;
    email: string;
    phone: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  // Admin auth
  adminToken: string | null;
  isAdmin: boolean;
  adminLogin: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved tokens on mount
  useEffect(() => {
    const savedUserToken = localStorage.getItem("skz_user_token");
    const savedUser = localStorage.getItem("skz_user_profile");
    const savedAdminToken = localStorage.getItem("skz_admin_token");

    if (savedUserToken && savedUser) {
      try {
        const parsedSavedUser = JSON.parse(savedUser);
        setUser(parsedSavedUser);
        setToken(savedUserToken);
        // Verify with server in background
        verifyUserTokenFn({ data: { token: savedUserToken } })
          .then((verified) => {
            if (verified) {
              const freshUser: UserProfile = {
                ...verified,
                name:
                  verified.name && verified.name !== "User"
                    ? verified.name
                    : parsedSavedUser.name || verified.name,
              };
              setUser(freshUser);
              localStorage.setItem("skz_user_profile", JSON.stringify(freshUser));
            } else {
              localStorage.removeItem("skz_user_token");
              localStorage.removeItem("skz_user_profile");
              setUser(null);
              setToken(null);
            }
          })
          .catch(() => {});
      } catch (e) {
        console.error(e);
      }
    }

    if (savedAdminToken) {
      setAdminToken(savedAdminToken);
      adminVerifyFn({ data: { token: savedAdminToken } })
        .then((valid) => {
          setIsAdmin(!!valid);
          if (!valid) {
            localStorage.removeItem("skz_admin_token");
            setAdminToken(null);
          }
        })
        .catch(() => setIsAdmin(false));
    }

    setLoading(false);
  }, []);

function sanitizeError(err: any, fallback: string): string {
  const msg = err?.message || "";
  if (typeof msg === "string" && (msg.includes("<!doctype") || msg.includes("<html") || msg.includes("This page didn't load"))) {
    return "Server or Database connection is offline. Please verify DATABASE_URL in .env (Neon / PostgreSQL).";
  }
  return msg || fallback;
}

  const login = async (identifier: string, pass: string) => {
    try {
      const res = await loginUserFn({ data: { identifier, password: pass } });
      if (res?.success && res?.user && res?.token) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem("skz_user_token", res.token);
        localStorage.setItem("skz_user_profile", JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: res?.error || "Login failed" };
    } catch (err: any) {
      return { success: false, error: sanitizeError(err, "Network error") };
    }
  };

  const register = async (name: string, email: string, phone: string, pass: string) => {
    try {
      const res = await registerUserFn({ data: { name, email, phone, password: pass } });
      if (res?.success && res?.user && res?.token) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem("skz_user_token", res.token);
        localStorage.setItem("skz_user_profile", JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: res?.error || "Registration failed" };
    } catch (err: any) {
      return { success: false, error: sanitizeError(err, "Network error") };
    }
  };

  const updateProfile = async (params: {
    name: string;
    email: string;
    phone: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    if (!user) return { success: false, error: "Not logged in" };
    try {
      const res = await updateUserProfileFn({
        data: {
          userId: user.id,
          ...params,
        },
      });
      if (res?.success && res?.user && res?.token) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem("skz_user_token", res.token);
        localStorage.setItem("skz_user_profile", JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: res?.error || "Failed to update profile" };
    } catch (err: any) {
      return { success: false, error: sanitizeError(err, "Failed to update profile") };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("skz_user_token");
    localStorage.removeItem("skz_user_profile");
  };

  const adminLoginHandler = async (username: string, pass: string) => {
    try {
      const res = await adminLoginFn({ data: { username, password: pass } });
      if (res?.success && res?.token) {
        setAdminToken(res.token);
        setIsAdmin(true);
        localStorage.setItem("skz_admin_token", res.token);
        return { success: true };
      }
      return { success: false, error: res?.error || "Invalid Admin Username or Password" };
    } catch (err: any) {
      return { success: false, error: sanitizeError(err, "Admin login error") };
    }
  };

  const adminLogoutHandler = () => {
    setAdminToken(null);
    setIsAdmin(false);
    localStorage.removeItem("skz_admin_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        updateProfile,
        logout,
        adminToken,
        isAdmin,
        adminLogin: adminLoginHandler,
        adminLogout: adminLogoutHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
