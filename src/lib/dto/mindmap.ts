// Mindmap DTOs
export interface MindmapResponse {
  id: number;
  title: string;
  description?: string;
  grade: string;
  subject: string;
  isAiGenerated: boolean;
  accessCount: number;
  favoriteCount: number;
  shareCount: number;
  visibility?: 'PRIVATE' | 'PUBLIC' | 'CLASSROOM';
  ownerRole?: 'STUDENT' | 'TEACHER';
  createdAt: string;
  updatedAt: string;
}

// Exercise DTOs
export interface ExerciseResponse {
  id: number;
  nodeId: number;
  question: string;
  solution?: string;
  hints?: string[];
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
  cognitiveLevel: 'RECOGNITION' | 'COMPREHENSION' | 'APPLICATION' | 'ADVANCED_APPLICATION';
  estimatedTime?: number;
  points?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseRequest {
  nodeId: number;
  question: string;
  solution?: string;
  hints?: string[];
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
  cognitiveLevel: 'RECOGNITION' | 'COMPREHENSION' | 'APPLICATION' | 'ADVANCED_APPLICATION';
  estimatedTime?: number;
  points?: number;
}

// Formula DTOs
export interface FormulaResponse {
  id: number;
  nodeId: number;
  formulaName: string;
  formulaText: string;
  formulaLatex?: string;
  variables?: Record<string, string>;
  conditions?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormulaRequest {
  nodeId: number;
  formulaName: string;
  formulaText: string;
  formulaLatex?: string;
  variables?: Record<string, string>;
  conditions?: string;
  isPrimary?: boolean;
}

// Concept DTOs
export interface ConceptResponse {
  id: number;
  nodeId: number;
  conceptName: string;
  definition: string;
  explanation?: string;
  keyPoints?: string[];
  examples?: string[];
  commonMistakes?: string[];
  tips?: string;
  prerequisites?: string;
  relatedConcepts?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConceptRequest {
  nodeId: number;
  conceptName: string;
  definition: string;
  explanation?: string;
  keyPoints?: string[];
  examples?: string[];
  commonMistakes?: string[];
  tips?: string;
  prerequisites?: string;
  relatedConcepts?: string;
}

// Classroom Mindmap DTOs
export interface ClassroomMindmapResponse {
  id: number;
  mindmapId: number;
  classroomId: number;
  teacherId: number;
  sharedAt: string;
  isActive: boolean;
  expiresAt?: string;
}

export interface ClassroomMindmapRequest {
  mindmapId: number;
  classroomId: number;
  expiresAt?: string;
}

// Node với thông tin chi tiết
export interface MindmapNodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
  size?: number;
  level?: number;
  content?: string;
  nodeType?: 'concept' | 'formula' | 'example' | 'exercise';
  exercises?: ExerciseResponse[];
  formulas?: FormulaResponse[];
  concepts?: ConceptResponse[];
}

export interface MindmapEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  color?: string;
}

// Generate Exercise Request
export interface GenerateExerciseRequest {
  nodeId: number;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
  cognitiveLevel: 'RECOGNITION' | 'COMPREHENSION' | 'APPLICATION' | 'ADVANCED_APPLICATION';
  numberOfExercises?: number;
}