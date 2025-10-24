// Classroom DTOs
export interface ClassroomResponse {
  id: number;
  name: string;
  description?: string;
  grade: string;
  subject: string;
  isPublic: boolean;
  currentStudents: number;
  maxStudents?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  points: number;
  dueDate: string;
  createdAt: string;
}