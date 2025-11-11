import { contentApi } from '@/lib/services/axios';

export interface GenerateQuizRequest {
  topic: string;
  grade: string;
  numQuestions: number;
}

export interface GeneratedQuizQuestion {
  text: string;
  type: string;
  points: number;
  options: Array<{
    text: string;
    correct: boolean;
  }>;
}

class AiQuizService {
  /**
   * Generate quiz questions using AI (backend via Gateway)
   * Gateway path: /api/v1/content/contents/{id}/quiz/generate
   * After StripPrefix=3: /contents/{id}/quiz/generate (matches QuizController)
   */
  async generateQuizQuestions(
    contentItemId: number,
    request: GenerateQuizRequest
  ): Promise<GeneratedQuizQuestion[]> {
    try {
      const response = await contentApi.post(
        `/contents/${contentItemId}/quiz/generate`,
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Error generating quiz questions:', error);
      throw new Error(
        error.response?.data?.message || 'Không thể tạo câu hỏi bằng AI'
      );
    }
  }
}

export const aiQuizService = new AiQuizService();
