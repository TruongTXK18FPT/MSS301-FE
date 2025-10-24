import { classroomApi } from './axios';
import { 
  ClassroomRequest, 
  ClassroomResponse, 
  ClassroomStats,
  ClassroomContent,
  Assignment,
  AssignmentSubmission,
  ApiResponse
} from '../dto';

class ClassroomService {
  /**
   * Tạo lớp học mới
   */
  async createClassroom(classroomData: ClassroomRequest): Promise<ClassroomResponse> {
    try {
      const response = await classroomApi.post<ApiResponse<ClassroomResponse>>('/api/v1/classrooms', classroomData);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tạo lớp học thất bại');
    }
  }

  /**
   * Cập nhật lớp học
   */
  async updateClassroom(id: number, classroomData: ClassroomRequest): Promise<ClassroomResponse> {
    try {
      const response = await classroomApi.put<ApiResponse<ClassroomResponse>>(`/api/v1/classrooms/${id}`, classroomData);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cập nhật lớp học thất bại');
    }
  }

  /**
   * Xóa lớp học
   */
  async deleteClassroom(id: number): Promise<void> {
    try {
      await classroomApi.delete(`/api/v1/classrooms/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Xóa lớp học thất bại');
    }
  }

  /**
   * Lấy lớp học theo ID
   */
  async getClassroomById(id: number): Promise<ClassroomResponse> {
    try {
      const response = await classroomApi.get<ApiResponse<ClassroomResponse>>(`/api/v1/classrooms/${id}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin lớp học');
    }
  }

  /**
   * Lấy lớp học của tôi
   */
  async getMyClassrooms(): Promise<ClassroomResponse[]> {
    try {
      const response = await classroomApi.get<ApiResponse<ClassroomResponse[]>>('/api/v1/classrooms/me');
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách lớp học');
    }
  }

  /**
   * Lấy lớp học công khai
   */
  async getPublicClassrooms(): Promise<ClassroomResponse[]> {
    try {
      const response = await classroomApi.get<ApiResponse<ClassroomResponse[]>>('/api/v1/classrooms/public');
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy lớp học công khai');
    }
  }

  /**
   * Tạo mã tham gia
   */
  async generateJoinCode(id: number): Promise<string> {
    try {
      const response = await classroomApi.post<ApiResponse<string>>(`/api/v1/classrooms/${id}/join-code`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tạo mã tham gia thất bại');
    }
  }

  /**
   * Tham gia lớp học bằng mã
   */
  async joinClassroomByCode(joinCode: string): Promise<ClassroomResponse> {
    try {
      const response = await classroomApi.post<ApiResponse<ClassroomResponse>>(`/api/v1/classrooms/join/${joinCode}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tham gia lớp học thất bại');
    }
  }

  /**
   * Lấy nội dung lớp học
   */
  async getClassroomContent(classroomId: number): Promise<ClassroomContent[]> {
    try {
      const response = await classroomApi.get<ApiResponse<ClassroomContent[]>>(`/api/v1/classrooms/${classroomId}/content`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy nội dung lớp học');
    }
  }

  /**
   * Tạo nội dung lớp học
   */
  async createClassroomContent(classroomId: number, contentData: Partial<ClassroomContent>): Promise<ClassroomContent> {
    try {
      const response = await classroomApi.post<ApiResponse<ClassroomContent>>(`/api/v1/classrooms/${classroomId}/content`, contentData);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tạo nội dung lớp học thất bại');
    }
  }

  /**
   * Lấy bài tập của lớp học
   */
  async getClassroomAssignments(classroomId: number): Promise<Assignment[]> {
    try {
      const response = await classroomApi.get<ApiResponse<Assignment[]>>(`/api/v1/classrooms/${classroomId}/assignments`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy bài tập');
    }
  }

  /**
   * Tạo bài tập mới
   */
  async createAssignment(classroomId: number, assignmentData: Partial<Assignment>): Promise<Assignment> {
    try {
      const response = await classroomApi.post<ApiResponse<Assignment>>(`/api/v1/classrooms/${classroomId}/assignments`, assignmentData);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tạo bài tập thất bại');
    }
  }

  /**
   * Nộp bài tập
   */
  async submitAssignment(assignmentId: number, submissionData: Partial<AssignmentSubmission>): Promise<AssignmentSubmission> {
    try {
      const response = await classroomApi.post<ApiResponse<AssignmentSubmission>>(`/api/v1/assignments/${assignmentId}/submit`, submissionData);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Nộp bài tập thất bại');
    }
  }

  /**
   * Lấy bài nộp của tôi
   */
  async getMySubmissions(assignmentId: number): Promise<AssignmentSubmission[]> {
    try {
      const response = await classroomApi.get<ApiResponse<AssignmentSubmission[]>>(`/api/v1/assignments/${assignmentId}/my-submissions`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy bài nộp');
    }
  }

  /**
   * Lấy thống kê lớp học
   */
  async getClassroomStats(): Promise<ClassroomStats> {
    try {
      const response = await classroomApi.get<ApiResponse<ClassroomStats>>('/api/v1/classrooms/stats');
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thống kê lớp học');
    }
  }

  /**
   * Lấy deadline sắp tới
   */
  async getUpcomingDeadlines(days: number = 7): Promise<Assignment[]> {
    try {
      const response = await classroomApi.get<ApiResponse<Assignment[]>>(`/api/v1/classrooms/deadlines?days=${days}`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy deadline');
    }
  }

  /**
   * Rời khỏi lớp học
   */
  async leaveClassroom(classroomId: number): Promise<void> {
    try {
      await classroomApi.delete(`/api/v1/classrooms/${classroomId}/leave`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Rời khỏi lớp học thất bại');
    }
  }

  /**
   * Lấy thành viên lớp học
   */
  async getClassroomMembers(classroomId: number): Promise<any[]> {
    try {
      const response = await classroomApi.get<ApiResponse<any[]>>(`/api/v1/classrooms/${classroomId}/members`);
      return response.data.result!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách thành viên');
    }
  }
}

export const classroomService = new ClassroomService();
export default classroomService;
