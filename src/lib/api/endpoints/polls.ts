import apiClient from "@/lib/api/client";
import {
  QuestionSerialzer,
  CreateResponseSerialzer,
  ResponseReport,
} from "@/types/poll.type";

/**
 * Get question list
 */
export const getQuestionList = async (): Promise<QuestionSerialzer[]> => {
  const response = await apiClient.get<QuestionSerialzer[]>(
    "/polls/question_list/"
  );
  return response.data;
};

/**
 * Get question by ID
 */
export const getQuestionListById = async (
  id: string
): Promise<QuestionSerialzer> => {
  const response = await apiClient.get<QuestionSerialzer>(
    `/polls/question_list/${id}/`
  );
  return response.data;
};

/**
 * Get questions
 */
export const getQuestions = async (): Promise<QuestionSerialzer[]> => {
  const response = await apiClient.get<QuestionSerialzer[]>(
    "/polls/questions/"
  );
  return response.data;
};

/**
 * Create new question
 */
export const createQuestion = async (
  questionData: Omit<QuestionSerialzer, 'id'>
): Promise<QuestionSerialzer> => {
  const response = await apiClient.post<QuestionSerialzer>(
    "/polls/questions/",
    {
      translations: questionData.translations.map(t => ({
        text: t.text,
        language_code: t.language_code
      }))
    }
  );
  return response.data;
};

/**
 * Get question by ID
 */
export const getQuestionById = async (
  id: string
): Promise<QuestionSerialzer> => {
  const response = await apiClient.get<QuestionSerialzer>(
    `/polls/questions/${id}/`
  );
  return response.data;
};

/**
 * Update question
 */
export const updateQuestion = async (
  id: string,
  questionData: Partial<QuestionSerialzer>
): Promise<QuestionSerialzer> => {
  const response = await apiClient.put<QuestionSerialzer>(
    `/polls/questions/${id}/`,
    {
      translations: questionData.translations?.map(t => ({
        text: t.text,
        language_code: t.language_code
      }))
    }
  );
  return response.data;
};

/**
 * Delete question
 */
export const deleteQuestion = async (id: string): Promise<void> => {
  await apiClient.delete(`/polls/questions/${id}/`);
};

/**
 * Report answers for a question
 */
export const reportAnswers = async (
  id: string
): Promise<ResponseReport> => {
  const response = await apiClient.post<ResponseReport>(
    `/polls/questions/${id}/report_answers/`
  );
  return response.data;
};

/**
 * Create response
 */
export const createResponse = async (
  responseData: CreateResponseSerialzer
): Promise<CreateResponseSerialzer> => {
  const response = await apiClient.post<CreateResponseSerialzer>(
    "/polls/responses/",
    responseData
  );
  return response.data;
};