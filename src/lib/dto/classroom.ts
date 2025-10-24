// Classroom DTOs
export interface ClassroomRequest {
  name: string;
  description?: string;
  grade?: string;
  subject?: string;
  isPublic?: boolean;
  maxStudents?: number;
}

export interface ClassroomResponse {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  grade?: string;
  subject?: string;
  isPublic: boolean;
  maxStudents?: number;
  currentStudents: number;
  joinCode?: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: number;
    username: string;
    email: string;
  };
  members?: ClassroomMember[];
}

export interface ClassroomMember {
  id: number;
  userId: number;
  classroomId: number;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  joinedAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface JoinClassroomRequest {
  joinCode: string;
}

export interface ClassroomStats {
  totalClassrooms: number;
  ownedClassrooms: number;
  joinedClassrooms: number;
  publicClassrooms: number;
  totalStudents: number;
  recentClassrooms: ClassroomResponse[];
}

export interface ClassroomContent {
  id: number;
  classroomId: number;
  title: string;
  description?: string;
  type: 'LESSON' | 'ASSIGNMENT' | 'QUIZ' | 'ANNOUNCEMENT';
  content?: string;
  attachments?: string[];
  dueDate?: string;
  points?: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
    email: string;
  };
}

export interface Assignment {
  id: number;
  classroomId: number;
  title: string;
  description?: string;
  content?: string;
  attachments?: string[];
  dueDate: string;
  points: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  content?: string;
  attachments?: string[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  student: {
    id: number;
    username: string;
    email: string;
  };
}
