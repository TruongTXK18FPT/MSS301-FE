// Profile DTOs
export interface StudentProfileRequest {
  fullName: string;
  dob?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  avatarUrl?: string;
  userType?: string;
}

export interface StudentProfileResponse {
  id: number;
  userId: number;
  email: string;
  fullName: string;
  dob?: string;
  phoneNumber?: string;
  address?: string;
  grade?: string;
  school?: string;
  learningGoals?: string;
  subjectsOfInterest?: string;
  bio?: string;
  avatarUrl?: string;
  profileCompleted: boolean;
  userType?: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileCompletionStatusResponse {
  profileCompleted: boolean;
  userType?: string;
  username?: string;
  email?: string;
}

export interface UserProfileRequest {
  fullName: string;
  dob?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  avatarUrl?: string;
  userType?: string;
}

export interface UserProfileResponse {
  id: number;
  userId: number;
  email: string;
  fullName: string;
  dob?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  avatarUrl?: string;
  profileCompleted: boolean;
  userType?: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
}
