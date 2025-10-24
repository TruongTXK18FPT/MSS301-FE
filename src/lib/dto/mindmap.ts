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
  createdAt: string;
  updatedAt: string;
}