import { mindmapApi } from './axios';
import { 
  MindmapResponse, 
  ApiResponse,
  ExerciseRequest,
  ExerciseResponse,
  FormulaRequest,
  FormulaResponse,
  ConceptRequest,
  ConceptResponse,
  ClassroomMindmapRequest,
  ClassroomMindmapResponse,
  GenerateExerciseRequest
} from '../dto';

class MindmapService {
  /**
   * Lấy danh sách mindmaps của user
   */
  async getUserMindmaps(): Promise<MindmapResponse[]> {
    try {
      const response = await mindmapApi.get<ApiResponse<MindmapResponse[]>>('');
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching user mindmaps:', error);
      return [];
    }
  }

  /**
   * Lấy tất cả mindmaps công khai từ tất cả users
   */
  async getPublicMindmaps(page: number = 0, size: number = 20): Promise<{ content: MindmapResponse[], totalElements: number, totalPages: number }> {
    try {
      const response = await mindmapApi.get<ApiResponse<any>>(`/public?page=${page}&size=${size}`);
      return response.data.result || { content: [], totalElements: 0, totalPages: 0 };
    } catch (error: any) {
      console.error('Error fetching public mindmaps:', error);
      return { content: [], totalElements: 0, totalPages: 0 };
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
    visibility?: 'PRIVATE' | 'PUBLIC' | 'CLASSROOM';
  }): Promise<MindmapResponse> {
    try {
      const response = await mindmapApi.post<ApiResponse<MindmapResponse>>('', data);
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
    visibility?: 'PRIVATE' | 'PUBLIC' | 'CLASSROOM';
    useDocuments?: boolean;
    documentId?: number;
    chapterId?: number;
    lessonId?: number;
  }): Promise<any> {
    try {
      console.log('[MindmapService] Calling generate mindmap with data:', data);
      const response = await mindmapApi.post<ApiResponse<any>>('/generate', data);
      console.log('[MindmapService] Response:', response.data);
      
      const result = (response.data as any).data || response.data.result;
      
      if (!result) {
        console.error('[MindmapService] No data in response:', response.data);
        throw new Error(response.data.message || 'Không nhận được dữ liệu mindmap');
      }
      
      return result;
    } catch (error: any) {
      console.error('[MindmapService] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || error.message || 'Tạo mindmap với AI thất bại');
    }
  }

  /**
   * Lấy mindmap theo ID (chỉ mindmap của user)
   */
  async getMindmapById(id: number): Promise<MindmapResponse> {
    try {
      const response = await mindmapApi.get<ApiResponse<MindmapResponse>>(`/${id}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lấy mindmap thất bại');
    }
  }

  /**
   * Xem mindmap (PUBLIC hoặc của user)
   */
  async viewMindmap(id: number): Promise<MindmapResponse> {
    try {
      const response = await mindmapApi.get<ApiResponse<MindmapResponse>>(`/view/${id}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể xem mindmap này');
    }
  }

  /**
   * Lấy tất cả nodes của một mindmap (chỉ mindmap của user)
   */
  async getMindmapNodes(id: number): Promise<any[]> {
    try {
      const response = await mindmapApi.get<ApiResponse<any[]>>(`/${id}/nodes`);
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching mindmap nodes:', error);
      throw new Error(error.response?.data?.message || 'Lấy nodes thất bại');
    }
  }

  /**
   * Xem nodes của mindmap (PUBLIC hoặc của user)
   */
  async viewMindmapNodes(id: number): Promise<any[]> {
    try {
      const response = await mindmapApi.get<ApiResponse<any[]>>(`/view/${id}/nodes`);
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error viewing mindmap nodes:', error);
      throw new Error(error.response?.data?.message || 'Không thể xem nodes');
    }
  }

  /**
   * Cập nhật mindmap (chỉ metadata)
   */
  async updateMindmap(id: number, data: {
    title?: string;
    description?: string;
    visibility?: 'PRIVATE' | 'PUBLIC' | 'CLASSROOM';
  }): Promise<MindmapResponse> {
    try {
      const response = await mindmapApi.put<ApiResponse<MindmapResponse>>(`/${id}`, data);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cập nhật mindmap thất bại');
    }
  }

  /**
   * Cập nhật mindmap với nodes và edges
   */
  async updateMindmapWithNodes(id: number, data: {
    title: string;
    description?: string;
    grade: string;
    subject: string;
    visibility?: 'PRIVATE' | 'PUBLIC' | 'CLASSROOM';
    nodes: any[];
    edges: any[];
  }): Promise<MindmapResponse> {
    try {
      console.log('[MindmapService] Updating mindmap with nodes:', { id, nodesCount: data.nodes.length, edgesCount: data.edges.length });
      const response = await mindmapApi.put<ApiResponse<MindmapResponse>>(`/${id}/nodes`, data);
      console.log('[MindmapService] Update response:', response.data);
      return response.data.result!;
    } catch (error: any) {
      console.error('[MindmapService] Update error:', error);
      throw new Error(error.response?.data?.message || 'Cập nhật mindmap với nodes thất bại');
    }
  }

  /**
   * Xóa mindmap
   */
  async deleteMindmap(id: number): Promise<void> {
    try {
      await mindmapApi.delete(`/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Xóa mindmap thất bại');
    }
  }

  /**
   * Tìm kiếm mindmaps
   */
  async searchMindmaps(keyword: string): Promise<MindmapResponse[]> {
    try {
      const response = await mindmapApi.get<ApiResponse<MindmapResponse[]>>(`/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error searching mindmaps:', error);
      return [];
    }
  }

  // ==================== EXERCISE API ====================
  
  /**
   * Tạo bài tập mới
   */
  async createExercise(data: ExerciseRequest): Promise<ExerciseResponse> {
    try {
      const response = await mindmapApi.post<ApiResponse<ExerciseResponse>>('/exercises', data);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tạo bài tập thất bại');
    }
  }

  /**
   * Lấy bài tập theo ID
   */
  async getExercise(id: number): Promise<ExerciseResponse> {
    try {
      const response = await mindmapApi.get<ApiResponse<ExerciseResponse>>(`/exercises/${id}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lấy bài tập thất bại');
    }
  }

  /**
   * Lấy tất cả bài tập của một node
   */
  async getExercisesByNode(nodeId: number): Promise<ExerciseResponse[]> {
    try {
      const response = await mindmapApi.get<ApiResponse<ExerciseResponse[]>>(`/exercises/node/${nodeId}`);
      return response.data.result || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lấy bài tập thất bại');
    }
  }

  /**
   * Cập nhật bài tập
   */
  async updateExercise(id: number, data: Partial<ExerciseRequest>): Promise<ExerciseResponse> {
    try {
      const response = await mindmapApi.put<ApiResponse<ExerciseResponse>>(`/exercises/${id}`, data);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cập nhật bài tập thất bại');
    }
  }

  /**
   * Xóa bài tập
   */
  async deleteExercise(id: number): Promise<void> {
    try {
      await mindmapApi.delete(`/exercises/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Xóa bài tập thất bại');
    }
  }

  /**
   * Tạo bài tập với AI
   */
  async generateExercises(data: GenerateExerciseRequest): Promise<ExerciseResponse[]> {
    try {
      const response = await mindmapApi.post<ApiResponse<ExerciseResponse[]>>('/exercises/generate', data);
      return response.data.result || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tạo bài tập với AI thất bại');
    }
  }

  // ==================== FORMULA API ====================
  
  /**
   * Tạo công thức mới
   */
  async createFormula(data: FormulaRequest): Promise<FormulaResponse> {
    try {
      const response = await mindmapApi.post<ApiResponse<FormulaResponse>>('/formulas', data);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tạo công thức thất bại');
    }
  }

  /**
   * Lấy công thức theo ID
   */
  async getFormula(id: number): Promise<FormulaResponse> {
    try {
      const response = await mindmapApi.get<ApiResponse<FormulaResponse>>(`/formulas/${id}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lấy công thức thất bại');
    }
  }

  /**
   * Lấy tất cả công thức của một node
   */
  async getFormulasByNode(nodeId: number): Promise<FormulaResponse[]> {
    try {
      const response = await mindmapApi.get<ApiResponse<FormulaResponse[]>>(`/formulas/node/${nodeId}`);
      return response.data.result || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lấy công thức thất bại');
    }
  }

  /**
   * Cập nhật công thức
   */
  async updateFormula(id: number, data: Partial<FormulaRequest>): Promise<FormulaResponse> {
    try {
      const response = await mindmapApi.put<ApiResponse<FormulaResponse>>(`/formulas/${id}`, data);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cập nhật công thức thất bại');
    }
  }

  /**
   * Xóa công thức
   */
  async deleteFormula(id: number): Promise<void> {
    try {
      await mindmapApi.delete(`/formulas/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Xóa công thức thất bại');
    }
  }

  // ==================== CONCEPT API ====================
  
  /**
   * Tạo khái niệm mới
   */
  async createConcept(data: ConceptRequest): Promise<ConceptResponse> {
    try {
      const response = await mindmapApi.post<ApiResponse<ConceptResponse>>('/concepts', data);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tạo khái niệm thất bại');
    }
  }

  /**
   * Lấy khái niệm theo ID
   */
  async getConcept(id: number): Promise<ConceptResponse> {
    try {
      const response = await mindmapApi.get<ApiResponse<ConceptResponse>>(`/concepts/${id}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lấy khái niệm thất bại');
    }
  }

  /**
   * Lấy tất cả khái niệm của một node
   */
  async getConceptsByNode(nodeId: number): Promise<ConceptResponse[]> {
    try {
      const response = await mindmapApi.get<ApiResponse<ConceptResponse[]>>(`/concepts/node/${nodeId}`);
      return response.data.result || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lấy khái niệm thất bại');
    }
  }

  /**
   * Generate concepts with AI
   */
  async generateConcepts(data: { nodeId: number; topic: string; numberOfConcepts: number }): Promise<ConceptResponse[]> {
    try {
      const response = await mindmapApi.post<ApiResponse<ConceptResponse[]>>('/concepts/generate', data);
      return response.data.result || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Generate concepts failed');
    }
  }

  /**
   * Generate formulas with AI
   */
  async generateFormulas(data: { nodeId: number; topic: string; numberOfFormulas: number }): Promise<FormulaResponse[]> {
    try {
      const response = await mindmapApi.post<ApiResponse<FormulaResponse[]>>('/formulas/generate', data);
      return response.data.result || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Generate formulas failed');
    }
  }

  /**
   * Cập nhật khái niệm
   */
  async updateConcept(id: number, data: Partial<ConceptRequest>): Promise<ConceptResponse> {
    try {
      const response = await mindmapApi.put<ApiResponse<ConceptResponse>>(`/concepts/${id}`, data);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cập nhật khái niệm thất bại');
    }
  }

  /**
   * Xóa khái niệm
   */
  async deleteConcept(id: number): Promise<void> {
    try {
      await mindmapApi.delete(`/concepts/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Xóa khái niệm thất bại');
    }
  }

  // ==================== CLASSROOM MINDMAP API ====================
  
  /**
   * Chia sẻ mindmap với lớp học
   */
  async shareMindmapToClassroom(data: ClassroomMindmapRequest): Promise<ClassroomMindmapResponse> {
    try {
      const response = await mindmapApi.post<ApiResponse<ClassroomMindmapResponse>>('/classroom', data);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Chia sẻ mindmap thất bại');
    }
  }

  /**
   * Lấy danh sách lớp học đã chia sẻ mindmap
   */
  async getSharedClassrooms(mindmapId: number): Promise<ClassroomMindmapResponse[]> {
    try {
      const response = await mindmapApi.get<ApiResponse<ClassroomMindmapResponse[]>>(`/classroom/mindmap/${mindmapId}`);
      return response.data.result || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lấy danh sách lớp học thất bại');
    }
  }

  /**
   * Hủy chia sẻ mindmap với lớp học
   */
  async unshareFromClassroom(id: number): Promise<void> {
    try {
      await mindmapApi.delete(`/classroom/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Hủy chia sẻ thất bại');
    }
  }
}

export const mindmapService = new MindmapService();
export default mindmapService;