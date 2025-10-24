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
  passwordSetupRequired: boolean;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  checkProfileStatus: () => Promise<void>;
  checkPasswordSetup: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profileCompleted, setProfileCompleted] = useState<boolean>(true);
  const [passwordSetupRequired, setPasswordSetupRequired] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const checkProfileStatus = useCallback(async () => {
    try {
      console.log('[Auth] Checking profile status...');
      const res = await AuthAPI.getProfileStatus();
      if (res.code === 1000 && res.result) {
        console.log('[Auth] Profile status:', res.result.profileCompleted);
        setProfileCompleted(res.result.profileCompleted);
      } else {
        console.log('[Auth] Profile status check failed:', res.message);
        setProfileCompleted(false); // Default to not completed if check fails
      }
    } catch (error) {
      console.error("[Auth] Failed to check profile status:", error);
      // Don't immediately fail - might be a temporary network issue
      console.log('[Auth] Profile status check failed, will retry later...');
      setProfileCompleted(false); // Default to not completed if check fails
      
      // Show notification instead of redirecting
      console.log('[Auth] Profile not completed - showing notification instead of redirect');
    }
  }, []);

  const checkPasswordSetup = useCallback(async () => {
    try {
      console.log('[Auth] Checking password setup requirement...');
      const res = await AuthAPI.introspect(token || '');
      if (res.code === 1000 && res.result) {
        setPasswordSetupRequired((res.result as any).passwordSetupRequired || false);
      }
    } catch (error) {
      console.error("[Auth] Failed to check password setup:", error);
      setPasswordSetupRequired(false);
    }
  }, [token]);

  const performIntrospect = useCallback(async (jwt: string) => {
    try {
      console.log('[Auth] Performing token introspect...');
      
      // Save token to globalThis.localStorage first (only on client side)
      if (globalThis.window !== undefined) {
        globalThis.localStorage.setItem("authToken", jwt);
      }
      setToken(jwt);
      
      const res = await AuthAPI.introspect(jwt);
      
      if (res.code === 1000 && res.result?.valid) {
        console.log('[Auth] Token is valid, setting user info...');
        setId(res.result.id ?? null);
        setEmail(res.result.email ?? null);
        setUsername(res.result.email ?? null); // Use email as username for now
        setRole(res.result.role ?? null);
        
        // Check profile status and password setup after successful introspect
        await checkProfileStatus();
        await checkPasswordSetup();
      } else {
        console.log('[Auth] Token is invalid, cleaning up...');
        // invalid token -> cleanup
        if (globalThis.window !== undefined) {
          globalThis.localStorage.removeItem("authToken");
        }
        setToken(null);
        setId(null);
        setEmail(null);
        setUsername(null);
        setRole(null);
        setProfileCompleted(true);
      }
    } catch (error) {
      console.error('[Auth] Introspect failed:', error);
      // Only clear token if it's definitely invalid, not on network errors     
      if ((error as any)?.message?.includes('Token invalid') || (error as any)?.message?.includes('Token validation failed')) {                                 
        console.log('[Auth] Token is definitely invalid, cleaning up...');      
        if (globalThis.window !== undefined) {
          globalThis.localStorage.removeItem("authToken");
        }
        setToken(null);
        setId(null);
        setEmail(null);
        setUsername(null);
        setRole(null);
        setProfileCompleted(true);
      } else {
        console.log('[Auth] Network or other error, keeping token for retry...');                                                                               
        // Don't clear token on network errors
      }
    }
  }, [checkProfileStatus, checkPasswordSetup]);

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (globalThis.window === undefined) {
      setLoading(false);
      return;
    }

    // Check for token in URL parameters first (for OAuth callback)
    const urlParams = new URLSearchParams(globalThis.window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      console.log('[Auth] Found token in URL, processing...');
      // Clean URL to remove token parameter first
      globalThis.window.history.replaceState({}, globalThis.document.title, globalThis.window.location.pathname);
      
      // Save token to localStorage immediately
      if (globalThis.window !== undefined) {
        globalThis.localStorage.setItem("authToken", urlToken);
      }
      setToken(urlToken);
      
      // Perform introspect - it will handle user info extraction
      performIntrospect(urlToken).finally(() => setLoading(false));
      return;
    }
    
    // Check globalThis.localStorage for existing token
    const jwt = globalThis.localStorage.getItem("authToken");
    if (!jwt) {
      console.log('[Auth] No token found in localStorage');
      setLoading(false);
      return;
    }
    
    console.log('[Auth] Found token in localStorage, validating...');
    setToken(jwt);
    performIntrospect(jwt).finally(() => setLoading(false));
  }, [performIntrospect]);

  const login = useCallback(async (jwt: string) => {
    if (globalThis.window !== undefined) {
      globalThis.localStorage.setItem("authToken", jwt);
    }
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
      if (globalThis.window !== undefined) {
        globalThis.localStorage.removeItem("authToken");
      }
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
    passwordSetupRequired,
    loading, 
    login, 
    logout, 
    checkProfileStatus,
    checkPasswordSetup
  }), [token, id, email, username, role, profileCompleted, passwordSetupRequired, loading, login, logout, checkProfileStatus, checkPasswordSetup]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}