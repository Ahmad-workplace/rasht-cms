/**
 * Represents a question in the main app.
 */
export interface QuestionSerialzer {
  id: string; // UUID format
  translations: Translation[];
}

export interface Translation {
  id: string;
  text: string;
  language_code: string;
}

/**
 * Represents the data required to create a response.
 */
export interface CreateResponseSerialzer {
  question_id: string; // UUID format
  response_text: string;
  // Add any additional fields as per your API schema
}

/**
 * Represents the response report after reporting answers.
 */
export interface ResponseReport {
  question_id: string; // UUID format
  total_responses: number;
  // Add any additional fields as per your API schema
}

/**
 * Represents an empty body (used for endpoints that don't require a request body).
 */
export interface EmptyBody {
  // No fields, as the body is empty
}

/**
 * Represents a paginated response for products (from your catalog.ts example).
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Represents a category (from your catalog.ts example).
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
}

/**
 * Represents a product (from your catalog.ts example).
 */
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: Category;
}

/**
 * Represents the data required to create a product (from your catalog.ts example).
 */
export interface CreateProduct {
  name: string;
  description?: string;
  price: number;
  category_id: string;
}
