import { contentApi } from './axios';

export interface ContentItem {
  id: number;
  ownerId: number;
  type: 'LESSON' | 'ASSIGNMENT' | 'QUIZ' | 'RESOURCE';
  title: string;
  description?: string;
  content: string;
  subject: string;
  grade: string;
  tags: string[];
  isPublic: boolean;
  classroomId?: number;  // Optional classroom association
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  contentItemId: number;
  timeLimitSec: number;
  shuffleQuestions: boolean;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id?: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  points: number;
  orderIndex: number;
  options?: QuizOption[];
  correctAnswer?: string;
}

export interface QuizOption {
  id?: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface Assignment {
  contentItemId: number;
  instructions: string;
  submissionType: 'TEXT' | 'FILE' | 'BOTH';
  attachmentFileIds?: string;
}

export interface QuizRequestPayload {
  timeLimitSec: number;
  shuffleQuestions: boolean;
  questions: QuizQuestion[];
}

export interface AssignmentRequestPayload {
  instructions: string;
  submissionType: 'TEXT' | 'FILE' | 'BOTH';
  attachmentFileIds?: string;
}

export interface Submission {
  id: number;
  assignmentId: number;
  studentId: number;
  studentName: string;
  content?: string;
  fileIds?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: number;
  status: 'pending' | 'graded' | 'late';
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  studentId: number;
  studentName: string;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  answers?: any;
}

class ContentService {
  // Since backend uses @RequestMapping("/api/v1/contents")
  // and Gateway strips prefix, we need to use just the endpoint path
  private baseUrl = '/contents';

  // ContentItem CRUD Operations
  async getContentItems(params?: {
    classroomId?: number;
    type?: string;
    subject?: string;
    grade?: string;
    isPublic?: boolean;
  }): Promise<ContentItem[]> {
    // If isPublic is true, use the /public endpoint
    if (params?.isPublic) {
      const response = await contentApi.get(`${this.baseUrl}/public`, { 
        params: {
          type: params.type,
          subject: params.subject,
          grade: params.grade
        }
      });
      return response.data.result || response.data;
    }
    
    // Otherwise use /me for user's own content
    const response = await contentApi.get(`${this.baseUrl}/me`, { 
      params: {
        classroomId: params?.classroomId,
        type: params?.type
      }
    });
    return response.data.result || response.data;
  }

  async getContentItemById(id: number): Promise<ContentItem> {
    const response = await contentApi.get(`${this.baseUrl}/${id}`);
    return response.data.result || response.data;
  }

  async getContentItemsByClassroom(classroomId: number, type?: string): Promise<ContentItem[]> {
    const response = await contentApi.get(`${this.baseUrl}/classroom/${classroomId}`, {
      params: type ? { type } : undefined
    });
    return response.data.result || response.data;
  }

  async createContentItem(data: Partial<ContentItem>): Promise<ContentItem> {
    // Extract classroomId to send as query param (backend expects @RequestParam)
    const { classroomId, tags, ...rest } = data;
    
    // Backend expects tags as comma-separated string
    const bodyData = {
      ...rest,
      tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
      content: rest.content || '', // Ensure content is not null
    };
    
    const response = await contentApi.post(this.baseUrl, bodyData, {
      params: classroomId ? { classroomId } : undefined
    });
    return response.data.result || response.data;
  }

  async updateContentItem(id: number, data: Partial<ContentItem>): Promise<ContentItem> {
    const response = await contentApi.put(`${this.baseUrl}/${id}`, data);
    return response.data.result || response.data;
  }

  async deleteContentItem(id: number): Promise<void> {
    await contentApi.delete(`${this.baseUrl}/${id}`);
  }

  // Quiz Operations
  async getQuiz(contentItemId: number): Promise<Quiz> {
    const response = await contentApi.get(`${this.baseUrl}/${contentItemId}/quiz`);
    return response.data.result || response.data;
  }

  async getQuizByContentId(contentItemId: number): Promise<Quiz> {
    return this.getQuiz(contentItemId);
  }

  async createOrUpdateQuiz(contentItemId: number, data: QuizRequestPayload): Promise<Quiz> {
    const response = await contentApi.put(`${this.baseUrl}/${contentItemId}/quiz`, data);
    return response.data.result || response.data;
  }

  // Assignment Operations
  async getAssignment(contentItemId: number): Promise<Assignment> {
    const response = await contentApi.get(`${this.baseUrl}/${contentItemId}/assignment`);
    return response.data.result || response.data;
  }

  async createOrUpdateAssignment(contentItemId: number, data: AssignmentRequestPayload): Promise<Assignment> {
    const response = await contentApi.put(`${this.baseUrl}/${contentItemId}/assignment`, data);
    return response.data.result || response.data;
  }

  // Combined Quiz Creation (ContentItem + Quiz in one call)
  async createQuiz(data: {
    title: string;
    description?: string;
    subject: string;
    grade: string;
    tags?: string[];
    isPublic: boolean;
    timeLimitSec: number;
    shuffleQuestions: boolean;
    questions: QuizQuestion[];
    classroomId?: number;
  }): Promise<{ contentItem: ContentItem; quiz: Quiz }> {
    // First create ContentItem
    const contentItem = await this.createContentItem({
      type: 'QUIZ',
      title: data.title,
      description: data.description,
      content: '', // Quiz content is in questions
      subject: data.subject,
      grade: data.grade,
      tags: data.tags || [],
      isPublic: data.isPublic,
    });

    // Then create Quiz with questions
    const quiz = await this.createOrUpdateQuiz(contentItem.id, {
      timeLimitSec: data.timeLimitSec,
      shuffleQuestions: data.shuffleQuestions,
      questions: data.questions,
    });

    return { contentItem, quiz };
  }

  // Combined Assignment Creation
  async createAssignment(data: {
    title: string;
    description?: string;
    instructions: string;
    subject: string;
    grade: string;
    tags?: string[];
    isPublic: boolean;
    submissionType: 'TEXT' | 'FILE' | 'BOTH';
    attachmentFileIds?: string;
    totalPoints?: number;
    dueDate?: string;
    classroomId?: number;
  }): Promise<{ contentItem: ContentItem; assignment: Assignment }> {
    // Create ContentItem with due date and points in content (or custom fields if backend supports)
    const contentItem = await this.createContentItem({
      type: 'ASSIGNMENT',
      title: data.title,
      description: data.description,
      content: JSON.stringify({
        totalPoints: data.totalPoints || 10,
        dueDate: data.dueDate,
      }),
      subject: data.subject,
      grade: data.grade,
      tags: data.tags || [],
      isPublic: data.isPublic,
    });

    // Create Assignment details
    const assignment = await this.createOrUpdateAssignment(contentItem.id, {
      instructions: data.instructions,
      submissionType: data.submissionType,
      attachmentFileIds: data.attachmentFileIds,
    });

    return { contentItem, assignment };
  }

  // Lesson Creation
  async createLesson(data: {
    title: string;
    description?: string;
    content: string;
    subject: string;
    grade: string;
    tags?: string[];
    isPublic: boolean;
    classroomId?: number;
  }): Promise<ContentItem> {
    return await this.createContentItem({
      type: 'LESSON',
      ...data,
      tags: data.tags || [],
    });
  }

  // Submission Operations
  async getSubmissions(assignmentId: number): Promise<Submission[]> {
    const response = await contentApi.get(`/submissions/assignment/${assignmentId}`);
    return response.data.result || response.data;
  }

  async submitAssignment(assignmentId: number, data: {
    content?: string;
    fileIds?: string;
  }): Promise<Submission> {
    const response = await contentApi.post(`/submissions/assignment/${assignmentId}`, data);
    return response.data.result || response.data;
  }

  async gradeSubmission(submissionId: number, data: {
    grade: number;
    feedback?: string;
  }): Promise<Submission> {
    const response = await contentApi.put(`/submissions/${submissionId}/grade`, data);
    return response.data.result || response.data;
  }

  async getMySubmissions(): Promise<Submission[]> {
    const response = await contentApi.get('/submissions/my-submissions');
    return response.data.result || response.data;
  }

  async getSubmissionStats(assignmentId: number): Promise<any> {
    const response = await contentApi.get(`/submissions/assignment/${assignmentId}/stats`);
    return response.data.result || response.data;
  }

  // Quiz Attempt Operations
  async getQuizAttempts(quizId: number): Promise<QuizAttempt[]> {
    const response = await contentApi.get(`/quiz-attempts/quiz/${quizId}`);
    return response.data.result || response.data;
  }

  async startQuizAttempt(quizId: number): Promise<QuizAttempt> {
    const response = await contentApi.post(`/quiz-attempts/quiz/${quizId}/start`);
    return response.data.result || response.data;
  }

  async submitQuizAttempt(attemptId: number, answers: any): Promise<QuizAttempt> {
    const response = await contentApi.put(`/quiz-attempts/${attemptId}/submit`, { answers });
    return response.data.result || response.data;
  }

  async getMyQuizAttempts(quizId: number): Promise<QuizAttempt[]> {
    const response = await contentApi.get(`/quiz-attempts/quiz/${quizId}/my-attempts`);
    return response.data.result || response.data;
  }

  async getQuizAttemptStats(quizId: number): Promise<any> {
    const response = await contentApi.get(`/quiz-attempts/quiz/${quizId}/stats`);
    return response.data.result || response.data;
  }

  // Search and Filter
  async searchContent(query: string, filters?: {
    type?: string;
    subject?: string;
    grade?: string;
    tags?: string[];
  }): Promise<ContentItem[]> {
    const params = {
      q: query,
      ...filters,
      tags: filters?.tags?.join(','),
    };
    const response = await contentApi.get(`${this.baseUrl}/search`, { params });
    return response.data.result || response.data;
  }

  // Bulk operations
  async bulkDelete(ids: number[]): Promise<void> {
    await contentApi.post(`${this.baseUrl}/bulk-delete`, { ids });
  }

  async duplicateContent(id: number): Promise<ContentItem> {
    const response = await contentApi.post(`${this.baseUrl}/${id}/duplicate`);
    return response.data.result || response.data;
  }
}

export const contentService = new ContentService();
export default contentService;
