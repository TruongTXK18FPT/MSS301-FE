import { apiFetch, API_BASE_URL, type ApiResponse } from "@/lib/api";
import { IntrospectResponse, LoginRequest, LoginResponse, RegisterRequest, VerifyEmailRequest, ProfileCompletionRequest, ProfileStatusResponse } from "@/types/auth";

export const AuthAPI = {
  login: async (data: LoginRequest) => {
    return apiFetch<LoginResponse>(`/authenticate/auth/login`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  register: async (data: RegisterRequest) => {
    return apiFetch<unknown>(`/authenticate/users/register`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  sendVerification: async (email: string) => {
    return apiFetch<unknown>(`/authenticate/auth/send-email-verification`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  verifyEmail: async (data: VerifyEmailRequest) => {
    return apiFetch<unknown>(`/authenticate/auth/verify-email`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  introspect: async (token: string) => {
    // For introspect, we send the token in the body, not in Authorization header
    // So we make a direct fetch call instead of using apiFetch
    const res = await fetch(`${API_BASE_URL}/authenticate/auth/introspect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    return (await res.json()) as ApiResponse<IntrospectResponse>;
  },
  completeProfile: async (data: ProfileCompletionRequest) => {
    return apiFetch<unknown>(`/authenticate/users/complete-profile`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  getProfileStatus: async () => {
    return apiFetch<ProfileStatusResponse>(`/authenticate/users/my-profile-status`, {
      method: "GET",
    });
  },
  resendOTP: async (email: string) => {
    return apiFetch<unknown>(`/authenticate/users/resend-otp?email=${encodeURIComponent(email)}`, {
      method: "POST",
    });
  },
};




