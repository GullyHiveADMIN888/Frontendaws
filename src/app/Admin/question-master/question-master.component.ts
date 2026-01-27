// src/app/features/admin/question-master/question-master.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QuestionService } from './services/question.service';
import { environment } from '../../../environments/environment.prod';
import { 
  Question, 
  CreateQuestion, 
  UpdateQuestion,
  Option,
  CreateOption,
  UpdateOption,
  QuestionWithOptions 
} from './models/question.model';

interface ServiceCategory {
  id: number;
  name: string;
  isActive: boolean;
}

@Component({
  selector: 'app-question-master',
  templateUrl: './question-master.component.html',
  styleUrls: ['./question-master.component.css']
})
export class QuestionMasterComponent implements OnInit {
  // Data properties
  questions: Question[] = [];
  filteredQuestions: Question[] = [];
  categories: ServiceCategory[] = []; // Fetched from backend

  // UI state properties
  loading: boolean = true;
  categoriesLoading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';

  // Modal properties
  showQuestionModal: boolean = false;
  showOptionModal: boolean = false;
  showOptionUpdateModal: boolean = false;
  isEditMode: boolean = false;
  currentQuestion: Question = this.getEmptyQuestion();
  currentOption: UpdateOption = this.getEmptyUpdateOption(); // Changed to UpdateOption
  modalLoading: boolean = false;
  selectedQuestionForOptions: Question | null = null;
  tempQuestionForOptions: Question | null = null; // NEW: Temporary storage for question reference

  // Stats properties
  totalQuestions: number = 0;
  activeQuestions: number = 0;
  mandatoryQuestions: number = 0;
  singleSelectQuestions: number = 0;

  // Question types
  questionTypes = [
    { value: 'single_select', label: 'Single Select' },
    { value: 'multiple_select', label: 'Multiple Select' },
  ];

  // Options list for a specific question
  questionOptions: Option[] = [];
  showOptionsModal: boolean = false;

  // API endpoints
  private apiUrl = `${environment.apiBaseUrl}/api/admin`;
  private categoryApiUrl = `${environment.apiBaseUrl}/admin/service-category-master`;

  constructor(
    private http: HttpClient,
    private questionService: QuestionService
  ) { }

  ngOnInit(): void {
    this.fetchCategoriesAndQuestions();
  }

  // Fetch both categories and questions
  fetchCategoriesAndQuestions(): void {
    this.loading = true;
    this.categoriesLoading = true;
    this.error = null;

    // Fetch categories first for dropdown
    this.http.get<ServiceCategory[]>(this.categoryApiUrl).subscribe({
      next: (categories) => {
        // Filter to show only active categories
        this.categories = categories.filter(cat => cat.isActive);
        this.categoriesLoading = false;
        
        // Then fetch questions
        this.fetchQuestions();
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        // Still try to fetch questions even if categories fail
        this.categories = [];
        this.categoriesLoading = false;
        this.fetchQuestions();
      }
    });
  }

  // Get empty question template
  getEmptyQuestion(): Question {
    return {
      id: 0,
      categoryId: 0,
      questionText: '',
      questionType: 'single_select',
      isMandatory: true,
      displayOrder: 1,
      isActive: true,
      options: [],
      updating: false,
      deleting: false
    };
  }

  getEmptyOption(): CreateOption {
    return {
      questionId: 0,
      optionText: '',
      // displayOrder: 0,
      isActive: true
    };
  }

  getEmptyUpdateOption(): UpdateOption {
    return {
      id: 0,
      questionId: 0,
      optionText: '',
      // displayOrder: 0,
      isActive: true
    };
  }

  // Modal Methods
  openAddModal(): void {
    this.isEditMode = false;
    this.currentQuestion = this.getEmptyQuestion();
    
    // Set default display order to next available
    this.currentQuestion.displayOrder = this.questions.length > 0
      ? Math.max(...this.questions.map(q => q.displayOrder)) + 1
      : 1;
    
    // Set default category to first active category if available
    if (this.categories.length > 0) {
      this.currentQuestion.categoryId = this.categories[0].id;
    }
    
    this.showQuestionModal = true;
  }

  openOptionModal(question: Question): void {
    console.log('Opening Option Modal for question:', question.id);
    this.selectedQuestionForOptions = question;
    this.currentOption = {
      id: 0,
      questionId: question.id,
      optionText: '',
      // displayOrder: this.calculateNextDisplayOrder(question),
      isActive: true
    };
    this.showOptionModal = true;
    console.log('showOptionModal set to:', this.showOptionModal);
  }

  // Helper method to calculate next display order
  private calculateNextDisplayOrder(question: Question): number {
    if (!question.options || question.options.length === 0) {
      return 1;
    }
    const maxOrder = Math.max(...question.options.map(opt => opt.displayOrder));
    return maxOrder + 1;
  }

  openOptionUpdateModal(option: Option): void {
    this.currentOption = {
      id: option.id,
      questionId: option.questionId,
      optionText: option.optionText,
      // displayOrder: option.displayOrder,
      isActive: option.isActive
    };
    this.showOptionUpdateModal = true;
    this.showOptionsModal = false; // Close options view modal
  }

  editQuestion(question: Question): void {
    this.isEditMode = true;
    this.currentQuestion = { 
      ...question,
      updating: false,
      deleting: false 
    };
    this.showQuestionModal = true;
  }

  closeQuestionModal(): void {
    this.showQuestionModal = false;
    this.currentQuestion = this.getEmptyQuestion();
    this.modalLoading = false;
  }

  closeOptionModal(): void {
    this.showOptionModal = false;
    this.currentOption = this.getEmptyUpdateOption();
    this.selectedQuestionForOptions = null;
  }

  closeOptionUpdateModal(): void {
    this.showOptionUpdateModal = false;
    this.currentOption = this.getEmptyUpdateOption();
  }

  saveQuestion(): void {
    if (this.isEditMode) {
      this.updateQuestion();
    } else {
      this.createQuestion();
    }
  }

  saveOption(): void {
    this.modalLoading = true;
    
    this.questionService.createOption(
      this.currentOption.questionId,
      {
        questionId: this.currentOption.questionId,
        optionText: this.currentOption.optionText,
        // displayOrder: this.currentOption.displayOrder,
        isActive: this.currentOption.isActive
      }
    ).subscribe({
      next: () => {
        this.fetchQuestions();
        this.closeOptionModal();
        this.modalLoading = false;
        alert('Option added successfully!');
      },
      error: (err) => {
        this.modalLoading = false;
        console.error('Error creating option:', err);
        alert('Failed to add option. Please try again.');
      }
    });
  }

  updateOption(): void {
    this.modalLoading = true;
    
    this.questionService.updateOption(
      this.currentOption.id,
      this.currentOption
    ).subscribe({
      next: () => {
        // Update local state for better UX
        this.updateLocalOption();
        this.closeOptionUpdateModal();
        this.modalLoading = false;
        alert('Option updated successfully!');
      },
      error: (err) => {
        this.modalLoading = false;
        console.error('Error updating option:', err);
        alert('Failed to update option. Please try again.');
      }
    });
  }

  // Helper method to update option in local state
  private updateLocalOption(): void {
    // Update in questionOptions array
    this.questionOptions = this.questionOptions.map(opt => 
      opt.id === this.currentOption.id ? { ...opt, ...this.currentOption } : opt
    );

    // Update in questions array
    this.questions = this.questions.map(q => {
      if (q.options && q.id === this.currentOption.questionId) {
        q.options = q.options.map(opt => 
          opt.id === this.currentOption.id ? { ...opt, ...this.currentOption } : opt
        );
      }
      return q;
    });
  }

  createQuestion(): void {
    // Validate required fields
    if (!this.currentQuestion.questionText.trim()) {
      alert('Question text is required!');
      return;
    }

    if (!this.currentQuestion.categoryId) {
      alert('Please select a category!');
      return;
    }

    const createData: CreateQuestion = {
      categoryId: this.currentQuestion.categoryId,
      questionText: this.currentQuestion.questionText,
      questionType: this.currentQuestion.questionType,
      isMandatory: this.currentQuestion.isMandatory,
      displayOrder: this.currentQuestion.displayOrder
    };

    this.modalLoading = true;

    this.questionService.createQuestion(createData).subscribe({
      next: () => {
        this.fetchQuestions();
        this.closeQuestionModal();
        alert('Question created successfully!');
      },
      error: (err) => {
        this.modalLoading = false;
        console.error('Error creating question:', err);
        alert('Failed to create question. Please try again.');
      }
    });
  }

  updateQuestion(): void {
    // Validate required fields
    if (!this.currentQuestion.questionText.trim()) {
      alert('Question text is required!');
      return;
    }

    if (!this.currentQuestion.categoryId) {
      alert('Please select a category!');
      return;
    }

    const updateData: UpdateQuestion = {
      categoryId: this.currentQuestion.categoryId,    
      questionText: this.currentQuestion.questionText,
      questionType: this.currentQuestion.questionType, 
      isMandatory: this.currentQuestion.isMandatory,
      displayOrder: this.currentQuestion.displayOrder,
      isActive: this.currentQuestion.isActive
    };

    this.modalLoading = true;

    this.questionService.updateQuestion(this.currentQuestion.id, updateData).subscribe({
      next: () => {
        this.fetchQuestions();
        this.closeQuestionModal();
        alert('Question updated successfully!');
      },
      error: (err) => {
        this.modalLoading = false;
        console.error('Error updating question:', err);
        alert('Failed to update question. Please try again.');
      }
    });
  }

  // Fetch questions from server
  fetchQuestions(): void {
    this.loading = true;
    this.error = null;

    this.questionService.getQuestions().subscribe({
      next: (data) => {
        // Initialize UI state properties
        this.questions = data.map(question => ({
          ...question,
          updating: false,
          deleting: false
        }));
        this.filteredQuestions = [...this.questions];
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load questions. Please try again.';
        this.loading = false;
        console.error('Error fetching questions:', err);
      }
    });
  }

  calculateStats(): void {
    this.totalQuestions = this.questions.length;
    this.activeQuestions = this.questions.filter(q => q.isActive).length;
    this.mandatoryQuestions = this.questions.filter(q => q.isMandatory).length;
    this.singleSelectQuestions = this.questions.filter(q => q.questionType === 'single_select').length;
  }

  filterQuestions(): void {
    if (!this.searchTerm.trim()) {
      this.filteredQuestions = [...this.questions];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredQuestions = this.questions.filter(question =>
      question.questionText.toLowerCase().includes(term) ||
      this.getQuestionTypeLabel(question.questionType).toLowerCase().includes(term) ||
      this.getCategoryName(question.categoryId).toLowerCase().includes(term)
    );
  }

  refreshData(): void {
    this.fetchCategoriesAndQuestions();
    this.searchTerm = '';
  }

  toggleActive(question: Question): void {
    const newStatus = !question.isActive;

    // Show loading state on the specific button
    question.updating = true;

    this.questionService.updateQuestion(question.id, {
      ...question,
      isActive: newStatus
    } as UpdateQuestion).subscribe({
      next: () => {
        // Update local state immediately for better UX
        question.isActive = newStatus;
        question.updating = false;
        this.calculateStats();
      },
      error: (err) => {
        question.updating = false;
        console.error('Error updating question status:', err);
        alert('Failed to update question status');
      }
    });
  }

  confirmDelete(question: Question): void {
    if (confirm(`Are you sure you want to delete "${question.questionText}"? This action cannot be undone.`)) {
      this.deleteQuestion(question);
    }
  }

  deleteQuestion(question: Question): void {
    // Show loading state on the specific button
    question.deleting = true;

    this.questionService.deleteQuestion(question.id).subscribe({
      next: () => {
        // Remove question from local array
        this.questions = this.questions.filter(q => q.id !== question.id);
        this.filteredQuestions = this.filteredQuestions.filter(q => q.id !== question.id);
        this.calculateStats();
      },
      error: (err) => {
        question.deleting = false;
        console.error('Error deleting question:', err);
        alert('Failed to delete question');
      }
    });
  }

  viewOptions(question: Question): void {
    this.selectedQuestionForOptions = question;
    this.questionService.getQuestionWithOptions(question.id).subscribe({
      next: (questionWithOptions) => {
        this.questionOptions = questionWithOptions.options || [];
        this.showOptionsModal = true;
      },
      error: (err) => {
        console.error('Error fetching options:', err);
        alert('Failed to load options');
      }
    });
  }

  getQuestionTypeLabel(type: string): string {
    const typeObj = this.questionTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  }

  getCategoryName(categoryId: number): string {
    if (!categoryId) return 'No Category';
    
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : `Category ${categoryId}`;
  }

  getQuestionTypeColor(type: string): string {
    switch (type) {
      case 'single_select': return 'bg-blue-100 text-blue-800';
      case 'multiple_select': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  changeDisplayOrder(questionId: number, direction: 'up' | 'down'): void {
    alert(`Change display order ${direction} for question ID: ${questionId}`);
  }

  closeOptionsModal(): void {
    this.showOptionsModal = false;
    this.questionOptions = [];
    // Don't clear selectedQuestionForOptions here - keep it for Add Another Option
  }

  // method for Add Another Option
  addAnotherOption(): void {
    console.log('addAnotherOption called');
    console.log('Current selectedQuestionForOptions:', this.selectedQuestionForOptions);
    
    // Save the question reference in a temporary variable
    this.tempQuestionForOptions = this.selectedQuestionForOptions;
    
    // Close the options view modal
    this.showOptionsModal = false;
    this.questionOptions = [];
    
    console.log('Options modal closed, tempQuestionForOptions:', this.tempQuestionForOptions);
    
    // Wait for modal to close completely, then open add option modal
    setTimeout(() => {
      if (this.tempQuestionForOptions) {
        console.log('Opening option modal for question:', this.tempQuestionForOptions.id);
        this.openOptionModal(this.tempQuestionForOptions);
        this.tempQuestionForOptions = null; // Clear temp variable
      } else {
        console.error('No question found to add option to');
      }
    }, 300); // Increased delay to ensure modal closes completely
  }

  // Keep the old method for compatibility
  addOptionFromViewModal(): void {
    this.addAnotherOption();
  }

  editOption(option: Option): void {
    this.openOptionUpdateModal(option);
  }

  deleteOption(option: Option): void {
    if (confirm(`Are you sure you want to delete option "${option.optionText}"?`)) {
      // Show loading on the specific option
      option.deleting = true;
      
      this.questionService.deleteOption(option.id).subscribe({
        next: () => {
          // Remove option from local array
          this.questionOptions = this.questionOptions.filter(opt => opt.id !== option.id);
          // Also update the question in the main list
          this.questions = this.questions.map(q => {
            if (q.id === option.questionId && q.options) {
              q.options = q.options.filter(opt => opt.id !== option.id);
            }
            return q;
          });
          this.calculateStats();
        },
        error: (err) => {
          option.deleting = false;
          console.error('Error deleting option:', err);
          alert('Failed to delete option');
        }
      });
    }
  }
}