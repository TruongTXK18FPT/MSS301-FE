"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthAPI } from "@/lib/services/auth.service";
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
  checkProfileStatus: (currentRole: string | null) => Promise<boolean>;
  checkPasswordSetupRequired: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profileCompleted, setProfileCompleted] = useState<boolean>(false);
  const [passwordSetupRequired, setPasswordSetupRequired] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const checkProfileStatus = useCallback(async (currentRole: string | null) => {
    try {
      console.log('[Auth] Checking profile status...');
      const res = await AuthAPI.getProfileStatus();
      console.log('[Auth] Profile status API response:', res);
      
      if (res.code === 1000 && res.result) {
        console.log('[Auth] Profile status:', res.result.profileCompleted, 'User type:', res.result.userType);
        
        // If role is null from introspect (Google first login), use userType from profile API
        if (!currentRole && res.result.userType) {
          console.log('[Auth] Setting role from userType:', res.result.userType);
          setRole(res.result.userType);
        }
        
        // Only STUDENT role needs profile completion
        // GUARDIAN and TEACHER are always considered completed
        const isCompleted = res.result.userType === 'STUDENT' 
          ? res.result.profileCompleted 
          : true;
        
        console.log('[Auth] Setting profileCompleted to:', isCompleted, 'for userType:', res.result.userType);
        setProfileCompleted(isCompleted);
        
        // Return the completion status for immediate use
        return isCompleted;
      } else {
        console.log('[Auth] Profile status check failed:', res.message);
        setProfileCompleted(false);
        return false;
      }
    } catch (error) {
      console.error("[Auth] Failed to check profile status:", error);
      setProfileCompleted(false);
      return false;
    }
  }, []);

  const checkPasswordSetupRequired = useCallback(async () => {
    try {
      if (!email) {
        console.log('[Auth] No email available for password setup check');
        setPasswordSetupRequired(false);
        return;
      }

      console.log('[Auth] Checking password setup status for:', email);
      const res = await AuthAPI.getPasswordSetupStatus(email);
      console.log('[Auth] Password setup API response:', res);
      
      if (res.code === 1000 && res.result !== undefined && res.result !== null) {
        console.log('[Auth] Password setup required:', res.result);
        setPasswordSetupRequired(res.result);
      } else {
        console.log('[Auth] Password setup check failed:', res.message);
        setPasswordSetupRequired(false);
      }
    } catch (error) {
      console.error('[Auth] Failed to check password setup status:', error);
      setPasswordSetupRequired(false);
    }
  }, [email]);

  const performIntrospect = useCallback(async (jwt: string) => {
    try {
      console.log('[Auth] Performing token introspect...');
      const res = await AuthAPI.introspect(jwt);
      
      if (res.code === 1000 && res.result?.valid) {
        console.log('[Auth] Token is valid, setting user info...');
        console.log('[Auth] Introspect result:', res.result);
        
        const userId = res.result.id ?? null;
        const userEmail = res.result.email ?? null;
        const userRole = res.result.role ?? null;
        
        setId(userId);
        setEmail(userEmail);
        setUsername(userEmail); // Use email as username for now
        setRole(userRole);
        
        console.log('[Auth] Role from introspect:', userRole);
        
        // Check profile status and wait for the result
        // Pass current role to checkProfileStatus so it can set role from userType if needed
        const isProfileCompleted = await checkProfileStatus(userRole);
        
        console.log('[Auth] Profile completed status:', isProfileCompleted);
        console.log('[Auth] If role was null, it should now be set from userType');
        
        // Check password setup status for Google users
        await checkPasswordSetupRequired();
        
        // Force a small delay to ensure all state updates are processed
        // This helps with race conditions in React state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } else {
        console.log('[Auth] Token is invalid, cleaning up...');
        // invalid token -> cleanup
        localStorage.removeItem("authToken");
        setToken(null);
        setId(null);
        setEmail(null);
        setUsername(null);
        setRole(null);
        setProfileCompleted(true);
      }
    } catch (error) {
      console.error('[Auth] Introspect failed:', error);
      // Token is invalid or network error -> cleanup
      localStorage.removeItem("authToken");
      setToken(null);
      setId(null);
      setEmail(null);
      setUsername(null);
      setRole(null);
      setProfileCompleted(true);
    }
  }, [checkProfileStatus, checkPasswordSetupRequired]);

  useEffect(() => {
    // Check for token in URL parameters first (for OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      console.log('[Auth] Found token in URL, processing...');
      // Clean URL to remove token parameter first
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Save token to localStorage immediately
      localStorage.setItem("authToken", urlToken);
      setToken(urlToken);
      
      // Perform introspect - it will handle user info extraction
      performIntrospect(urlToken).finally(() => setLoading(false));
      return;
    }
    
    // Check localStorage for existing token
    const jwt = localStorage.getItem("authToken");
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
    localStorage.setItem("authToken", jwt);
    setToken(jwt);
    await performIntrospect(jwt);
    // No need to call checkProfileStatus again, it's already called in performIntrospect
  }, [performIntrospect]);

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
      setPasswordSetupRequired(false);
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
    checkPasswordSetupRequired
  }), [token, id, email, username, role, profileCompleted, passwordSetupRequired, loading, login, logout, checkProfileStatus, checkPasswordSetupRequired]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}




