import { contentApi } from '../lib/services/axios';

export interface QuizQuestionRequest {
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  points: number;
  explanation?: string;
  options: QuizOptionRequest[];
}

export interface QuizOptionRequest {
  text: string;
  correct: boolean;
}

export interface QuizQuestionResponse {
  id: number;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  points: number;
  explanation?: string;
  options: QuizOptionResponse[];
}

export interface QuizOptionResponse {
  id: number;
  text: string;
  correct: boolean;
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
