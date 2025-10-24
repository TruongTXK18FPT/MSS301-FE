import { apiFetch, API_BASE_URL, type ApiResponse } from "@/lib/api";

export interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  birthDate?: string;
  school?: string;
  grade?: string;
  learningGoals?: string;
  subjectsOfInterest?: string;
  profileCompleted: boolean;
  userType: string;
  isGoogleUser?: boolean;
  passwordSetupRequired?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileCompletionStatus {
  profileCompleted: boolean;
  userType: string;
  email: string;
}

export interface UpdateProfileRequest {
  phoneNumber?: string;
  birthDate?: string;
  school?: string;
  grade?: string;
  learningGoals?: string;
  subjectsOfInterest?: string;
}

export const ProfileAPI = {
  getCurrentProfile: async () => {
    return apiFetch<ProfileData>(`/profile/profile/me`, {
      method: "GET",
    });
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    return apiFetch<ProfileData>(`/profile/profile/me`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getProfileCompletionStatus: async () => {
    return apiFetch<ProfileCompletionStatus>(`/profile/profile/completion-status`, {
      method: "GET",
    });
  },
};
