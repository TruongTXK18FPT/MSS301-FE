import { StudentProfileResponse } from './index';

export interface GuardianProfileResponse {
  id: number;
  userId: number;
  fullName: string;
  dob: string;
  phoneNumber: string;
  address: string;
  bio: string;
  avatarUrl: string;
  relationship: string;
  phoneAlt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentGuardianResponse {
  studentId: number;
  guardianId: number;
  studentProfile?: StudentProfileResponse;
  guardianProfile?: GuardianProfileResponse;
}

export interface GuardianProfileWithStudents extends GuardianProfileResponse {
  students: StudentProfileResponse[];
}
