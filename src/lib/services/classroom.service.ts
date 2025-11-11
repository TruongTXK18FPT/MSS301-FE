import { classroomApi } from '@/lib/services/axios';
import { 
  Classroom, 
  Assignment, 
  Quiz, 
  Student, 
  CreateClassroomRequest, 
  JoinClassroomRequest,
  CreateAssignmentRequest,
  CreateQuizRequest,
  ApiResponse 
} from '@/lib/dto/classroom';

class ClassroomService {
  // Classroom Management
  async getMyClassrooms(): Promise<Classroom[]> {
    try {
      const response = await classroomApi.get<ApiResponse<Classroom[]>>('/me');
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching classrooms:', error);
      return [];
    }
  }

  async createClassroom(data: CreateClassroomRequest): Promise<Classroom> {
    try {
      console.log('[ClassroomService] Creating classroom with data:', data);
      const response = await classroomApi.post<ApiResponse<Classroom>>('', data);
      console.log('[ClassroomService] Response:', response.data);
      
      // Try both 'data' and 'result' fields
      const result = (response.data as any).data || response.data.result;
      
      if (!result) {
        console.error('[ClassroomService] No data in response:', response.data);
        throw new Error('Không nhận được dữ liệu classroom');
      }
      
      return result;
    } catch (error: any) {
      console.error('[ClassroomService] Error creating classroom:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      throw new Error(error.response?.data?.message || 'Tạo classroom thất bại');
    }
  }

  async getClassroomById(id: number): Promise<Classroom> {
    try {
      const response = await classroomApi.get<ApiResponse<Classroom>>(`/${id}`);
      return response.data.result || {} as Classroom;
    } catch (error: any) {
      console.error('Error fetching classroom:', error);
      throw error;
    }
  }

  async updateClassroom(id: number, data: Partial<CreateClassroomRequest>): Promise<Classroom> {
    try {
      const response = await classroomApi.put<ApiResponse<Classroom>>(`/${id}`, data);
      return response.data.result || {} as Classroom;
    } catch (error: any) {
      console.error('Error updating classroom:', error);
      throw error;
    }
  }

  async deleteClassroom(id: number): Promise<void> {
    try {
      await classroomApi.delete(`/${id}`);
    } catch (error: any) {
      console.error('Error deleting classroom:', error);
      throw error;
    }
  }

  async searchClassrooms(keyword: string): Promise<Classroom[]> {
    try {
      const response = await classroomApi.get<ApiResponse<Classroom[]>>(`/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data.result || {} as Classroom;
    } catch (error: any) {
      console.error('Error searching classrooms:', error);
      return [];
    }
  }

  async joinClassroom(data: JoinClassroomRequest): Promise<Classroom> {
    try {
      const response = await classroomApi.post<ApiResponse<Classroom>>('/join', data);
      return response.data.result || {} as Classroom;
    } catch (error: any) {
      console.error('Error joining classroom:', error);
      throw error;
    }
  }

  async getClassroomStudents(classroomId: number): Promise<Student[]> {
    try {
      const response = await classroomApi.get<ApiResponse<Student[]>>(`/${classroomId}/students`);
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching students:', error);
      return [];
    }
  }

  async removeStudent(classroomId: number, studentId: number): Promise<void> {
    try {
      await classroomApi.delete(`/${classroomId}/students/${studentId}`);
    } catch (error: any) {
      console.error('Error removing student:', error);
      throw error;
    }
  }

  // Assignment Management
  async getClassroomAssignments(classroomId: number): Promise<Assignment[]> {
    try {
      const response = await classroomApi.get<ApiResponse<Assignment[]>>(`/assignments/classroom/${classroomId}`);
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }

  async createAssignment(classroomId: number, data: CreateAssignmentRequest): Promise<Assignment> {
    try {
      const response = await classroomApi.post<ApiResponse<Assignment>>(`/assignments/classroom/${classroomId}`, data);
      return response.data.result || {} as Assignment;
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  async updateAssignment(id: number, data: Partial<CreateAssignmentRequest>): Promise<Assignment> {
    try {
      const response = await classroomApi.put<ApiResponse<Assignment>>(`/assignments/${id}`, data);
      return response.data.result || {} as Assignment;
    } catch (error: any) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  async deleteAssignment(id: number): Promise<void> {
    try {
      await classroomApi.delete(`/assignments/${id}`);
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }

  async publishAssignment(id: number): Promise<void> {
    try {
      await classroomApi.post(`/assignments/${id}/publish`);
    } catch (error: any) {
      console.error('Error publishing assignment:', error);
      throw error;
    }
  }

  async unpublishAssignment(id: number): Promise<void> {
    try {
      await classroomApi.post(`/assignments/${id}/unpublish`);
    } catch (error: any) {
      console.error('Error unpublishing assignment:', error);
      throw error;
    }
  }

  // Quiz Management
  async getClassroomQuizzes(classroomId: number): Promise<Quiz[]> {
    try {
      const response = await classroomApi.get<ApiResponse<Quiz[]>>(`/quizzes/classroom/${classroomId}`);
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching quizzes:', error);
      return [];
    }
  }

  async createQuiz(classroomId: number, data: CreateQuizRequest): Promise<Quiz> {
    try {
      const response = await classroomApi.post<ApiResponse<Quiz>>(`/quizzes/classroom/${classroomId}`, data);
      return response.data.result || {} as Quiz;
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  }

  async updateQuiz(id: number, data: Partial<CreateQuizRequest>): Promise<Quiz> {
    try {
      const response = await classroomApi.put<ApiResponse<Quiz>>(`/quizzes/${id}`, data);
      return response.data.result || {} as Quiz;
    } catch (error: any) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  }

  async deleteQuiz(id: number): Promise<void> {
    try {
      await classroomApi.delete(`/quizzes/${id}`);
    } catch (error: any) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  }

  async publishQuiz(id: number): Promise<void> {
    try {
      await classroomApi.post(`/quizzes/${id}/publish`);
    } catch (error: any) {
      console.error('Error publishing quiz:', error);
      throw error;
    }
  }

  async unpublishQuiz(id: number): Promise<void> {
    try {
      await classroomApi.post(`/quizzes/${id}/unpublish`);
    } catch (error: any) {
      console.error('Error unpublishing quiz:', error);
      throw error;
    }
  }

  // Classroom Summary (NEW)
  async getClassroomSummary(classroomId: number): Promise<any> {
    try {
      const response = await classroomApi.get<ApiResponse<any>>(`/${classroomId}/summary`);
      return response.data.result || {};
    } catch (error: any) {
      console.error('Error fetching classroom summary:', error);
      throw error;
    }
  }

  // Classroom Contents (NEW)
  async getClassroomContents(classroomId: number, studentView: boolean = false): Promise<any[]> {
    try {
      const endpoint = studentView 
        ? `/${classroomId}/contents/student-view`
        : `/${classroomId}/contents`;
      const response = await classroomApi.get<ApiResponse<any[]>>(endpoint);
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching classroom contents:', error);
      return [];
    }
  }

  // Submissions (NEW)
  async getAllSubmissions(classroomContentId: number): Promise<any[]> {
    try {
      const response = await classroomApi.get<ApiResponse<any[]>>(
        `/contents/${classroomContentId}/submissions/all`
      );
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  }

  // Grading (NEW)
  async gradeSubmission(submissionId: number, points: number, feedback?: string): Promise<any> {
    try {
      const response = await classroomApi.post<ApiResponse<any>>(
        `/submissions/${submissionId}/grade`,
        { points, feedback }
      );
      return response.data.result;
    } catch (error: any) {
      console.error('Error grading submission:', error);
      throw error;
    }
  }

  // Lesson CRUD
  async createLesson(classroomId: number, data: {
    title: string;
    description?: string;
    content: string;
    type: string; // 'LESSON'
    visible?: boolean;
    publishAt?: string;
    orderIndex?: number;
  }): Promise<any> {
    const response = await classroomApi.post(
      `/${classroomId}/contents/create`,
      data
    );
    return response.data.result || response.data;
  }

  async updateLesson(classroomId: number, contentId: number, data: {
    title: string;
    description?: string;
    content: string;
    type: string;
    visible?: boolean;
    publishAt?: string;
  }): Promise<any> {
    const response = await classroomApi.put(
      `/${classroomId}/contents/update/${contentId}`,
      data
    );
    return response.data.result || response.data;
  }

  async deleteLesson(classroomId: number, contentId: number): Promise<void> {
    await classroomApi.delete(
      `/${classroomId}/contents/delete/${contentId}`
    );
  }

  // Attach existing content (mindmap/quiz/assignment) to classroom
  async attachContent(classroomId: number, data: {
    contentId: number;
    type: string; // 'RESOURCE' | 'QUIZ' | 'ASSIGNMENT'
    visible?: boolean;
    orderIndex?: number;
  }): Promise<any> {
    const response = await classroomApi.post(
      `/${classroomId}/contents/attach`,
      data
    );
    return response.data.result || response.data;
  }
}

export const classroomService = new ClassroomService();
export default classroomService;

