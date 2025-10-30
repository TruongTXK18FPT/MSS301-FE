import { contentApi } from '../lib/services/axios';

export interface QuizQuestionRequest {
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  points: number;
  explanation?: string;
  options: QuizOptionRequest[];
  orderIndex?: number;
}

export interface QuizOptionRequest {
  optionText: string;
  isCorrect: boolean;
  orderIndex?: number;
}

export interface QuizQuestionResponse {
  id: number;
  quizId: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  points: number;
  explanation?: string;
  orderIndex?: number;
  options: QuizOptionResponse[];
}

export interface QuizOptionResponse {
  id: number;
  questionId: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex?: number;
}

export const quizService = {
  // Get all questions for a quiz
  getQuestions: async (quizId: number): Promise<QuizQuestionResponse[]> => {
    const response = await contentApi.get(`/contents/${quizId}/quiz/questions`);
    return response.data.data;
  },

  // Get a single question
  getQuestion: async (quizId: number, questionId: number): Promise<QuizQuestionResponse> => {
    const response = await contentApi.get(`/contents/${quizId}/quiz/questions/${questionId}`);
    return response.data.data;
  },

  // Add a single question
  addQuestion: async (quizId: number, request: QuizQuestionRequest): Promise<QuizQuestionResponse> => {
    const response = await contentApi.post(`/contents/${quizId}/quiz/questions`, request);
    return response.data.data;
  },

  // Add multiple questions at once
  addQuestions: async (quizId: number, requests: QuizQuestionRequest[]): Promise<QuizQuestionResponse[]> => {
    const response = await contentApi.post(`/contents/${quizId}/quiz/questions/batch`, requests);
    return response.data.data;
  },

  // Update a question
  updateQuestion: async (
    quizId: number,
    questionId: number,
    request: QuizQuestionRequest
  ): Promise<QuizQuestionResponse> => {
    const response = await contentApi.put(`/contents/${quizId}/quiz/questions/${questionId}`, request);
    return response.data.data;
  },

  // Delete a question
  deleteQuestion: async (quizId: number, questionId: number): Promise<void> => {
    await contentApi.delete(`/contents/${quizId}/quiz/questions/${questionId}`);
  },
};
