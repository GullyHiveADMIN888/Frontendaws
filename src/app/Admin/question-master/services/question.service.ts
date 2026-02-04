import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { 
  Question, 
  QuestionResponse, 
  CreateQuestion, 
  UpdateQuestion,
  QuestionWithOptions,
  Option,
  CreateOption,
  UpdateOption,
  SubCategory
} from '../models/question.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = `${environment.apiBaseUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Questions endpoints
  getQuestions(): Observable<Question[]> {
    return this.http.get<QuestionResponse[]>(`${this.apiUrl}/questions`)
      .pipe(
        map(responses => responses.map(this.transformQuestionResponse))
      );
  }

  getQuestion(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/questions/${id}`);
  }

  createQuestion(question: CreateQuestion): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/questions`, question);
  }

  updateQuestion(id: number, question: UpdateQuestion): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/questions/${id}`, question);
  }

  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/questions/${id}`);
  }

  toggleQuestionStatus(id: number, isActive: boolean): Observable<Question> {
    return this.http.patch<Question>(`${this.apiUrl}/questions/${id}/status`, { isActive });
  }

  getQuestionWithOptions(id: number): Observable<QuestionWithOptions> {
    return this.http.get<QuestionWithOptions>(`${this.apiUrl}/questions/${id}/with-options`);
  }

  // Options endpoints
  getOptions(): Observable<Option[]> {
    return this.http.get<Option[]>(`${this.apiUrl}/options`);
  }

  getOption(id: number): Observable<Option> {
    return this.http.get<Option>(`${this.apiUrl}/options/${id}`);
  }

  createOption(questionId: number, option: CreateOption): Observable<Option> {
    return this.http.post<Option>(`${this.apiUrl}/questions/${questionId}/options`, option);
  }

  updateOption(id: number, option: UpdateOption): Observable<Option> {
    return this.http.put<Option>(`${this.apiUrl}/options/${id}`, option);
  }

  deleteOption(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/options/${id}`);
  }

  // SubCategory endpoints
  getSubCategoriesByCategory(categoryId: number): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(`${this.apiUrl}/sub-category-master/by-category/${categoryId}`);
  }

getSubCategoryById(id: number): Observable<SubCategory> {
  return this.http.get<SubCategory>(`${this.apiUrl}/sub-category-master/${id}`);
}

  // Helper method to transform response
  private transformQuestionResponse(response: QuestionResponse): Question {
    return {
      id: response.id,
      categoryId: response.category_id,
      subCategoryId: response.subcat_id || 0, 
      questionText: response.question_text,
      questionType: response.question_type,
      isMandatory: response.is_mandatory,
      displayOrder: response.display_order,
      isActive: response.is_active,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
      options: typeof response.options === 'string' ? JSON.parse(response.options) : response.options
    };
  }
}