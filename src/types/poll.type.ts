/**
 * Represents a translation for a question
 */
export interface Translation {
  id?: string;
  text: string;
  language_code: string;
}

/**
 * Represents a question in the main app.
 */
export interface QuestionSerialzer {
  id: string; // UUID format
  translations: Translation[];
}

/**
 * Represents the data required to create a response.
 */
export interface CreateResponseSerialzer {
  question_id: string; // UUID format
  response_text: string;
}

/**
 * Represents the response report after reporting answers.
 */
export interface ResponseReport {
  worst: string;
  bad: string;
  middle: string;
  good: string;
  perfect: string;
}

/**
 * Represents a paginated response
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}