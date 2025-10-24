import { mindmapApi } from './axios';
import { 
  MindmapRequest, 
  MindmapResponse, 
  AiGenerateMindmapRequest, 
  AiGenerateMindmapResponse,
  RagMindmapRequest,
  RagMindmapResponse,
  MindmapStats,
  ApiResponse
} from '../dto';

class MindmapService {
  /**
   * Tạo mindmap mới
   */
  async createMindmap(mindmapData: MindmapRequest): Promise<MindmapResponse> {
    try {
      const response = await mindmapApi.post<ApiResponse<MindmapResponse>>('/api/v1/mindmap', mindmapData);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tạo mindmap thất bại');
    }
  }

  /**
   * Tạo mindmap với AI
   */
  async generateMindmapWithAI(aiRequest: AiGenerateMindmapRequest): Promise<AiGenerateMindmapResponse> {
    try {
      const response = await mindmapApi.post<ApiResponse<AiGenerateMindmapResponse>>('/api/v1/mindmap/generate', aiRequest);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tạo mindmap với AI thất bại');
    }
  }

  /**
   * Tạo mindmap với RAG
   */
  async generateRagMindmap(ragRequest: RagMindmapRequest): Promise<RagMindmapResponse> {
    try {
      const response = await mindmapApi.post<ApiResponse<RagMindmapResponse>>('/api/v1/rag-mindmap/generate', ragRequest);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tạo mindmap với RAG thất bại');
    }
  }

  /**
   * Lấy mindmap theo ID
   */
  async getMindmapById(id: number): Promise<MindmapResponse> {
    try {
      const response = await mindmapApi.get<ApiResponse<MindmapResponse>>(`/api/v1/mindmap/${id}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy mindmap');
    }
  }

  /**
   * Lấy tất cả mindmaps của user
   */
  async getUserMindmaps(): Promise<MindmapResponse[]> {
    try {
      const response = await mindmapApi.get<ApiResponse<MindmapResponse[]>>('/api/v1/mindmap');
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách mindmaps');
    }
  }

  /**
   * Lấy mindmaps công khai
   */
  async getPublicMindmaps(page: number = 0, size: number = 10): Promise<{
    content: MindmapResponse[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const response = await mindmapApi.get<ApiResponse<{
        content: MindmapResponse[];
        totalElements: number;
        totalPages: number;
        currentPage: number;
      }>>(`/api/v1/mindmap/public?page=${page}&size=${size}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy mindmaps công khai');
    }
  }

  /**
   * Tìm kiếm mindmaps
   */
  async searchMindmaps(keyword: string): Promise<MindmapResponse[]> {
    try {
      const response = await mindmapApi.get<ApiResponse<MindmapResponse[]>>(`/api/v1/mindmap/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tìm kiếm mindmaps thất bại');
    }
  }

  /**
   * Cập nhật mindmap
   */
  async updateMindmap(id: number, mindmapData: MindmapRequest): Promise<MindmapResponse> {
    try {
      const response = await mindmapApi.put<ApiResponse<MindmapResponse>>(`/api/v1/mindmap/${id}`, mindmapData);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cập nhật mindmap thất bại');
    }
  }

  /**
   * Xóa mindmap
   */
  async deleteMindmap(id: number): Promise<void> {
    try {
      await mindmapApi.delete(`/api/v1/mindmap/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Xóa mindmap thất bại');
    }
  }

  /**
   * Chia sẻ mindmap
   */
  async shareMindmap(id: number): Promise<string> {
    try {
      const response = await mindmapApi.post<ApiResponse<string>>(`/api/v1/mindmap/${id}/share`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Chia sẻ mindmap thất bại');
    }
  }

  /**
   * Lấy mindmap được chia sẻ
   */
  async getSharedMindmap(shareCode: string): Promise<MindmapResponse> {
    try {
      const response = await mindmapApi.get<ApiResponse<MindmapResponse>>(`/api/v1/mindmap/shared/${shareCode}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy mindmap được chia sẻ');
    }
  }

  /**
   * Lấy thống kê mindmaps của user
   */
  async getUserMindmapStats(): Promise<MindmapStats> {
    try {
      const response = await mindmapApi.get<ApiResponse<MindmapStats>>('/api/v1/mindmap/stats');
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thống kê mindmaps');
    }
  }

  /**
   * Kiểm tra xem user có thể tạo thêm mindmap không
   */
  async canCreateMindmap(isPremium: boolean = false): Promise<boolean> {
    try {
      const response = await mindmapApi.get<ApiResponse<boolean>>(`/api/v1/mindmap/can-create?isPremium=${isPremium}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể kiểm tra quyền tạo mindmap');
    }
  }

  /**
   * Kiểm tra sức khỏe RAG service
   */
  async checkRagServiceHealth(): Promise<boolean> {
    try {
      const response = await mindmapApi.get<ApiResponse<boolean>>('/api/v1/rag-mindmap/health');
      return response.data.result!;
    } catch (error: any) {
      console.error('RAG service health check failed:', error);
      return false;
    }
  }

  /**
   * Lấy tài liệu liên quan cho RAG
   */
  async getRelevantDocuments(topic: string, maxDocuments: number = 5): Promise<any[]> {
    try {
      const response = await mindmapApi.post<ApiResponse<any[]>>('/api/v1/rag-mindmap/documents', {
        topic,
        maxDocuments
      });
      return response.data.result!;
    } catch (error: any) {
      console.error('Error getting relevant documents:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy tài liệu liên quan');
    }
  }
}

export const mindmapService = new MindmapService();
export default mindmapService;
