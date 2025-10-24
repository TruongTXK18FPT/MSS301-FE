// Classroom Types
export interface Classroom {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  isPublic: boolean;
  joinCode?: string;
  password?: string;
  maxStudents: number;
  currentStudents: number;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: number;
  classroomId: number;
  title: string;
  description?: string;
  points: number;
  dueDate: string;
  isPublished: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: number;
  classroomId: number;
  title: string;
  description?: string;
  timeLimit: number; // minutes
  points: number;
  startTime: string;
  endTime: string;
  isPublished: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  joinedAt: string;
  role: 'STUDENT';
}

export interface JoinClassroomRequest {
  classroomCode: string;
  password: string;
}

export interface CreateClassroomRequest {
  name: string;
  description?: string;
  isPublic: boolean;
  password?: string;
  maxStudents?: number;
}

export interface CreateAssignmentRequest {
  title: string;
  description?: string;
  points: number;
  dueDate: string;
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  timeLimit: number;
  points: number;
  startTime: string;
  endTime: string;
}

// User Roles
export type UserRole = 'TEACHER' | 'STUDENT' | 'GUARDIAN';

// Permission Types
export interface Permission {
  canCreateClassroom: boolean;
  canManageStudents: boolean;
  canCreateAssignments: boolean;
  canCreateQuizzes: boolean;
  canViewAllClassrooms: boolean;
  canJoinClassrooms: boolean;
  canSubmitAssignments: boolean;
  canTakeQuizzes: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}
