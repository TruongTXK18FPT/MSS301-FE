import { mindmapApi } from './axios';
import { MindmapResponse, ApiResponse } from '../dto';

class MindmapService {
  /**
   * Lấy danh sách mindmaps của user
   */
  async getUserMindmaps(): Promise<MindmapResponse[]> {
    try {
      const response = await mindmapApi.get<ApiResponse<MindmapResponse[]>>('/mindmap/user');
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
}

export const mindmapService = new MindmapService();
export default mindmapService;