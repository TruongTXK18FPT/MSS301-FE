import { gatewayApi } from './axios';

// DTOs
export interface ChatSessionRequest {
  userId: number;
  expertProfileId?: number; // Optional, prefer expertProfileCode
  expertProfileCode?: string; // Preferred way to identify expert profile
}

export interface ChatbotRequest {
  messages: string;
  gradeLevel?: string;
  documentId?: string; // ID của document để chat theo giáo trình (RAG)
  chapterId?: string; // ID của chapter (RAG)
  lessonId?: string; // ID của lesson (RAG)
  fileStoreName?: string; // Google File Search Store name (cho RAG với file-search)
  useVoiceChat?: boolean; // Sử dụng voice chat với TTS
}

export enum ChatRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM'
}

export interface ChatResponse {
  messageId: number;
  role: ChatRole;
  content: string;
  tokensUsed: number;
  createdAt: string;
  audioUrl?: string; // URL của audio từ TTS (nếu có)
  sources?: Source[]; // Sources từ RAG (nếu có)
}

export interface Source {
  content: string;
  score: number;
  documentId?: string;
  chapterId?: string;
  lessonId?: string;
  chapterTitle?: string;
  lessonTitle?: string;
  pageNumber?: number;
}

export interface ChatSessionResponse {
  id: number;
  userId: number;
  expertProfileId: number;
  expertProfileName: string;
  title: string;
  status: boolean;
  createTime: string;
  updateTime: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// Expert Profiles
export interface ExpertProfile {
  id: number;
  code: string;
  name: string;
  description: string;
  specialty: string;
  icon?: string;
  useRag?: boolean; // Sử dụng RAG service
  llmProvider?: 'GEMINI' | 'MISTRAL';
}

export const EXPERT_PROFILES: ExpertProfile[] = [
  {
    id: 1,
    code: 'algebra-master',
    name: 'Algebra Master',
    description: 'Chuyên gia về đại số và phương trình',
    specialty: 'Đại số & Phương trình',
    llmProvider: 'GEMINI'
  },
  {
    id: 2,
    code: 'geometry-genius',
    name: 'Geometry Genius',
    description: 'Thầy giáo hình học thông minh',
    specialty: 'Hình học & Không gian',
    llmProvider: 'GEMINI'
  },
  {
    id: 3,
    code: 'calculus-wizard',
    name: 'Calculus Wizard',
    description: 'Pháp sư giải tích cao cấp',
    specialty: 'Giải tích & Vi tích phân',
    llmProvider: 'MISTRAL'
  },
  {
    id: 4,
    code: 'problem-solver',
    name: 'Problem Solver',
    description: 'Chuyên gia giải bài tập tổng hợp',
    specialty: 'Giải bài tập tổng hợp',
    llmProvider: 'MISTRAL'
  },
  {
    id: 5,
    code: 'rag-tutor',
    name: 'RAG Tutor',
    description: 'Trợ lý học tập thông minh, chat theo giáo trình đã upload',
    specialty: 'Chat theo tài liệu',
    useRag: true,
    llmProvider: 'GEMINI'
  }
];

class ChatbotService {
  private readonly baseUrl = '/api/v1/chatbot';

  /**
   * Tạo session chat mới
   */
  async createSession(request: ChatSessionRequest): Promise<number> {
    const response = await gatewayApi.post<ApiResponse<number>>(
      `${this.baseUrl}/sessions`,
      request
    );
    return response.data.result;
  }

  /**
   * Gửi tin nhắn trong session
   */
  async sendMessage(
    sessionId: number,
    request: ChatbotRequest
  ): Promise<ChatResponse> {
    const response = await gatewayApi.post<ApiResponse<ChatResponse>>(
      `${this.baseUrl}/sessions/${sessionId}`,
      request
    );
    return response.data.result;
  }

  /**
   * Lấy danh sách sessions theo userId
   */
  async getSessionsByUserId(userId: number): Promise<ChatSessionResponse[]> {
    const response = await gatewayApi.get<ApiResponse<ChatSessionResponse[]>>(
      `${this.baseUrl}/sessions`,
      {
        params: { userId }
      }
    );
    return response.data.result;
  }

  /**
   * Lấy tất cả tin nhắn trong session
   */
  async getSessionMessages(sessionId: number): Promise<ChatResponse[]> {
    const response = await gatewayApi.get<ApiResponse<ChatResponse[]>>(
      `${this.baseUrl}/sessions/${sessionId}`
    );
    return response.data.result;
  }

  /**
   * Xóa session
   */
  async deleteSession(sessionId: number): Promise<void> {
    await gatewayApi.delete<ApiResponse<void>>(
      `${this.baseUrl}/sessions/${sessionId}`
    );
  }

  /**
   * Lấy expert profile theo code
   */
  getExpertProfileByCode(code: string): ExpertProfile | undefined {
    return EXPERT_PROFILES.find(profile => profile.code === code);
  }

  /**
   * Lấy expert profile theo id
   */
  getExpertProfileById(id: number): ExpertProfile | undefined {
    return EXPERT_PROFILES.find(profile => profile.id === id);
  }
}

export const chatbotService = new ChatbotService();

