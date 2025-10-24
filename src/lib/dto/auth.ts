// Auth DTOs
export interface UserResponse {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ProfileCompletionRequest {
  fullName: string;
  phoneNumber?: string;
  birthDate?: string;
  school?: string;
  grade?: string;
  learningGoals?: string;
  subjectsOfInterest?: string;
}

export interface ProfileStatusResponse {
  profileCompleted: boolean;
  userType: string;
  email: string;
}

export interface IntrospectResponse {
  valid: boolean;
  id?: string;
  email?: string;
  role?: string;
  passwordSetupRequired?: boolean;
}