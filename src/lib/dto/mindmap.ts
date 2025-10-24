// Mindmap DTOs
export interface MindmapRequest {
  title: string;
  description?: string;
  grade?: string;
  subject?: string;
  isPublic?: boolean;
}

export interface MindmapResponse {
  id: number;
  title: string;
  description?: string;
  userId: number;
  grade?: string;
  subject?: string;
  isPublic: boolean;
  isAiGenerated: boolean;
  aiProvider?: string;
  aiModel?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  accessCount: number;
  favoriteCount: number;
  shareCount: number;
  nodes?: MindmapNode[];
  edges?: MindmapEdge[];
}

export interface MindmapNode {
  id: number;
  mindmapId: number;
  label: string;
  x: number;
  y: number;
  color?: string;
  size?: number;
  shape?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MindmapEdge {
  id: number;
  mindmapId: number;
  sourceNodeId: number;
  targetNodeId: number;
  label?: string;
  color?: string;
  style?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiGenerateMindmapRequest {
  topic: string;
  grade?: string;
  subject?: string;
  aiProvider: 'mistral' | 'gemini';
  aiModel?: string;
  maxNodes?: number;
  complexity?: 'simple' | 'medium' | 'complex';
}

export interface AiGenerateMindmapResponse {
  mindmap: MindmapResponse;
  aiProvider: string;
  aiModel: string;
  generationTime: number;
  tokensUsed?: number;
}

export interface RagMindmapRequest {
  topic: string;
  grade?: string;
  subject?: string;
  aiProvider: 'mistral' | 'gemini';
  aiModel?: string;
  documentQuery?: string;
  useRag?: boolean;
  maxDocuments?: number;
  similarityThreshold?: number;
}

export interface RagMindmapResponse {
  mindmap: MindmapResponse;
  ragResults: {
    documentsUsed: number;
    sourceDocuments: string[];
    relevanceScore: number;
    ragContext: string;
  };
  aiProvider: string;
  aiModel: string;
  generationTime: number;
}

export interface MindmapStats {
  totalMindmaps: number;
  publicMindmaps: number;
  privateMindmaps: number;
  aiGeneratedMindmaps: number;
  totalAccessCount: number;
  totalFavoriteCount: number;
  totalShareCount: number;
  recentMindmaps: MindmapResponse[];
}
