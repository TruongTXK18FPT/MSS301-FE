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
    // Save token to localStorage first
    localStorage.setItem("authToken", jwt);
    setToken(jwt);
    
    const res = await AuthAPI.introspect(jwt);
    if (res.code === 1000 && res.result?.valid) {
      setId(res.result.id ?? null);
      setEmail(res.result.email ?? null);
      setUsername(res.result.email ?? null); // Use email as username for now
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
    // Check for token in URL parameters first (for OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      // Clean URL to remove token parameter first
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Perform introspect - it will handle saving token to localStorage
      performIntrospect(urlToken).finally(() => setLoading(false));
      return;
    }
    
    // Check localStorage for existing token
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

  const logout = useCallback(async () => {
    try {
      // Call backend logout API if token exists
      if (token) {
        await AuthAPI.logout(token);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage and state
      localStorage.removeItem("authToken");
      setToken(null);
      setId(null);
      setEmail(null);
      setUsername(null);
      setRole(null);
      setProfileCompleted(true);
      router.push("/auth/login");
    }
  }, [router, token]);

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




