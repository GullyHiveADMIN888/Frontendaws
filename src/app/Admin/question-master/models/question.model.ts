// src/app/features/admin/question-master/models/question.model.ts
export interface Question {
  id: number;
  categoryId: number;
  subCategoryId?: number;
  questionText: string;
  questionType: string;
  isMandatory: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  options?: Option[];
  updating?: boolean; 
  deleting?: boolean; 
}

export interface QuestionResponse {
  id: number;
  category_id: number;
  subcat_id: number;
  question_text: string;
  question_type: string;
  is_mandatory: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  options: string | Option[];
}

export interface CreateQuestion {
  categoryId: number;
  subCategoryId?: number;
  questionText: string;
  questionType: string;
  isMandatory: boolean;
  displayOrder: number;
}

export interface UpdateQuestion {
  questionText: string;
  isMandatory: boolean;
  displayOrder: number;
  isActive: boolean;
  categoryId: number;
  subCategoryId?: number;
  questionType: string;
}

export interface QuestionWithOptions {
  id: number;
  categoryId: number;
  subCategoryId?: number;
  questionText: string;
  questionType: string;
  isMandatory: boolean;
  displayOrder: number;
  isActive: boolean;
  options: Option[];
  updating?: boolean;
  deleting?: boolean;
}

export interface Option {
  id: number;
  questionId: number;
  optionText: string;
  displayOrder: number;
  isActive: boolean;
  updating?: boolean;
  deleting?: boolean;
}

export interface CreateOption {
  questionId: number;
  optionText: string;
  // displayOrder: number;
  isActive: boolean;
}

export interface UpdateOption {
  id: number;
  questionId: number;
  optionText: string;
  // displayOrder: number;
  isActive: boolean;
}

export interface SubCategory {
  id: number;
  categoryId: number;
  name: string;
  isActive: boolean;
}