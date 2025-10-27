import { mindmapApi } from './axios';
import { MindmapResponse, ApiResponse } from '../dto';

class MindmapService {
  /**
   * Lấy danh sách mindmaps của user
   */
  async getUserMindmaps(): Promise<MindmapResponse[]> {
    try {
      const response = await mindmapApi.get<ApiResponse<MindmapResponse[]>>('/mindmap');
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching user mindmaps:', error);
      return [];
    }
  }

  /**
   * Tạo mindmap mới
   */
  async createMindmap(data: {
    title: string;
    description?: string;
    grade: string;
    subject: string;
  }): Promise<MindmapResponse> {
    try {
      const response = await mindmapApi.post<ApiResponse<MindmapResponse>>('/mindmap', data);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tạo mindmap thất bại');
    }
  }

  /**
   * Tạo mindmap với AI (RAG)
   */
  async generateMindmapWithAi(data: {
    topic: string;
    description?: string;
    grade: string;
    subject: string;
    aiProvider: 'MISTRAL' | 'GEMINI';
    aiModel?: string;
  }): Promise<any> {
    try {
      const response = await mindmapApi.post<ApiResponse<any>>('/mindmap/generate', data);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tạo mindmap với AI thất bại');
    }
  }

  /**
   * Lấy mindmap theo ID
   */
  async getMindmapById(id: number): Promise<MindmapResponse> {
    try {
      const response = await mindmapApi.get<ApiResponse<MindmapResponse>>(`/mindmap/${id}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lấy mindmap thất bại');
    }
  }

  /**
   * Xóa mindmap
   */
  async deleteMindmap(id: number): Promise<void> {
    try {
      await mindmapApi.delete(`/mindmap/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Xóa mindmap thất bại');
    }
  }

  /**
   * Tìm kiếm mindmaps
   */
  async searchMindmaps(keyword: string): Promise<MindmapResponse[]> {
    try {
      const response = await mindmapApi.get<ApiResponse<MindmapResponse[]>>(`/mindmap/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error searching mindmaps:', error);
      return [];
    }
  }
}

export const mindmapService = new MindmapService();
export default mindmapService;