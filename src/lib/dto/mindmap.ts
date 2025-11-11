// Mindmap DTOs
export interface MindmapResponse {
  id: number;
  userId?: number;
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

// Generate Mindmap Request
export interface GenerateMindmapRequest {
  topic: string;
  description?: string;
  grade: string;
  subject: string;
  aiProvider: 'MISTRAL' | 'GEMINI';
  aiModel?: string;
  visibility?: 'PRIVATE' | 'PUBLIC' | 'CLASSROOM';
  useDocuments: boolean;  // false = Direct AI (Gemini), true = RAG from documents (Mistral)
  documentId?: number;
  chapterId?: number;
  lessonId?: number;
}

// Exercise DTOs
export interface ExerciseResponse {
  id: number;
  nodeId: number;
  question: string;
  answer?: string;
  solution?: string;
  hints?: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
  cognitiveLevel: 'RECOGNITION' | 'COMPREHENSION' | 'APPLICATION' | 'ADVANCED_APPLICATION';
  estimatedTime?: number;
  orderIndex?: number;
  isActive?: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseRequest {
  nodeId: number;
  question: string;
  answer?: string;
  solution?: string;
  hints?: string; // JSON array string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
  cognitiveLevel?: 'RECOGNITION' | 'COMPREHENSION' | 'APPLICATION' | 'ADVANCED_APPLICATION';
  estimatedTime?: number;
  orderIndex?: number;
  isActive?: boolean;
}

// Formula DTOs
export interface FormulaResponse {
  id: number;
  nodeId: number;
  name: string;
  formulaText: string;
  formulaLatex?: string;
  description?: string;
  usageExample?: string;
  variables?: string; // JSON string
  conditions?: string;
  orderIndex?: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormulaRequest {
  nodeId: number;
  name: string;
  formulaText: string;
  formulaLatex?: string;
  description?: string;
  usageExample?: string;
  variables?: string; // JSON string
  conditions?: string;
  orderIndex?: number;
  isPrimary?: boolean;
}

// Concept DTOs
export interface ConceptResponse {
  id: number;
  nodeId: number;
  name: string;
  definition: string;
  explanation?: string;
  keyPoints?: string;
  examples?: string;
  commonMistakes?: string;
  tips?: string;
  prerequisites?: string;
  relatedConcepts?: string;
  orderIndex?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConceptRequest {
  nodeId: number;
  name: string;
  definition: string;
  explanation?: string;
  keyPoints?: string;
  examples?: string;
  commonMistakes?: string;
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