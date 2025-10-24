// Authentication related types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  authenticated: boolean;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: "STUDENT" | "TEACHER" | "GUARDIAN";
  // Optional extended fields will be handled in complete-profile; keep base minimal
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface IntrospectResponse {
  valid: boolean;
  email: string;
  id: string;
  username: string;
  role?: string;
  userId?: string;
  scope?: string;
  expiresAt?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  token: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

// Profile Completion Types
export interface ProfileStatusResponse {
  profileCompleted: boolean;
  userType: string;
  username: string;
  email: string;
}

export interface StudentProfileData {
  phone: string;
  birthDate: string; // yyyy-MM-dd
  school?: string;
  grade?: string;
  learningGoals?: string;
  subjectsOfInterest?: string;
}

export interface TeacherProfileData {
  phone: string;
  birthDate: string; // yyyy-MM-dd
  department?: string;
  specialization?: string;
  yearsOfExperience?: number;
  qualifications?: string;
  bio?: string;
}

export interface GuardianProfileData {
  phone: string;
  birthDate: string; // yyyy-MM-dd
  relationship?: string;
  studentEmail?: string;
  studentPhone?: string;
}

export interface ProfileCompletionRequest {
  userType: "STUDENT" | "TEACHER" | "GUARDIAN";
  data: StudentProfileData | TeacherProfileData | GuardianProfileData;
}
