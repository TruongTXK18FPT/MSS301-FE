"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthAPI } from "@/services/auth.service";
import { useRouter } from "next/navigation";

type AuthState = {
  token: string | null;
  id: string | null;
  email: string | null;
  username: string | null;
  role: string | null;
  profileCompleted: boolean;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  checkProfileStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profileCompleted, setProfileCompleted] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  const checkProfileStatus = useCallback(async () => {
    try {
      const res = await AuthAPI.getProfileStatus();
      if (res.code === 1000 && res.result) {
        setProfileCompleted(res.result.profileCompleted);
      }
    } catch (error) {
      console.error("Failed to check profile status:", error);
    }
  }, []);

  const performIntrospect = useCallback(async (jwt: string) => {
    const res = await AuthAPI.introspect(jwt);
    if (res.code === 1000 && res.result?.valid) {
      setId(res.result.id ?? null);
      setEmail(res.result.email ?? null);
      setUsername(res.result.username ?? null);
      setRole(res.result.role ?? null);
      // Check profile status after successful introspect
      await checkProfileStatus();
    } else {
      // invalid token -> cleanup
      localStorage.removeItem("authToken");
      setToken(null);
      setId(null);
      setEmail(null);
      setUsername(null);
      setRole(null);
      setProfileCompleted(true);
    }
  }, [checkProfileStatus]);

  useEffect(() => {
    const jwt = localStorage.getItem("authToken");
    if (!jwt) {
      setLoading(false);
      return;
    }
    setToken(jwt);
    performIntrospect(jwt).finally(() => setLoading(false));
  }, [performIntrospect]);

  const login = useCallback(async (jwt: string) => {
    localStorage.setItem("authToken", jwt);
    setToken(jwt);
    await performIntrospect(jwt);
    await checkProfileStatus();
  }, [performIntrospect, checkProfileStatus]);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setToken(null);
    setId(null);
    setEmail(null);
    setUsername(null);
    setRole(null);
    setProfileCompleted(true);
    router.push("/auth/login");
  }, [router]);

  const value = useMemo(() => ({ 
    token, 
    id, 
    email, 
    username, 
    role, 
    profileCompleted, 
    loading, 
    login, 
    logout, 
    checkProfileStatus 
  }), [token, id, email, username, role, profileCompleted, loading, login, logout, checkProfileStatus]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}




