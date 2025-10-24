import { apiFetch, API_BASE_URL, type ApiResponse } from "@/lib/api";

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export const PasswordAPI = {
  changePassword: async (data: ChangePasswordRequest) => {
    return apiFetch<unknown>(`/authenticate/auth/change-password`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  setupPasswordForGoogleUser: async (email: string, newPassword: string) => {
    return apiFetch<unknown>(`/authenticate/auth/google/setup-password?email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`, {
      method: "POST",
    });
  },
};
