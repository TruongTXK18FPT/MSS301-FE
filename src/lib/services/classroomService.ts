import { classroomApi } from './axios';
import { ClassroomResponse, Assignment, ApiResponse } from '../dto/classroom';

class ClassroomService {
  /**
   * Lấy danh sách classrooms của user
   */
  async getMyClassrooms(): Promise<ClassroomResponse[]> {
    try {
      const response = await classroomApi.get<ApiResponse<ClassroomResponse[]>>('/classroom/my');
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching classrooms:', error);
      return [];
    }
  }

  /**
   * Lấy danh sách bài tập sắp đến hạn
   */
  async getUpcomingDeadlines(days: number = 7): Promise<Assignment[]> {
    try {
      const response = await classroomApi.get<ApiResponse<Assignment[]>>(`/classroom/assignments/upcoming?days=${days}`);
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }
}

export const classroomService = new ClassroomService();
export default classroomService;