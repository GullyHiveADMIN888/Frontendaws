import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { QuestionService } from './services/question.service';
import { environment } from '../../../environments/environment.prod';
import { 
  Question, 
  CreateQuestion, 
  UpdateQuestion,
  Option,
  CreateOption,
  UpdateOption,
  QuestionWithOptions,
  SubCategory
} from './models/question.model';

interface ServiceCategory {
  id: number;
  name: string;
  isActive: boolean;
}

interface QuestionWithSubCategory extends Question {
  subCategoryName?: string;
}

@Component({
  selector: 'app-question-master',
  templateUrl: './question-master.component.html',
  styleUrls: ['./question-master.component.css']
})
export class QuestionMasterComponent implements OnInit {
  // Data properties
  questions: QuestionWithSubCategory[] = [];
  filteredQuestions: QuestionWithSubCategory[] = [];
  categories: ServiceCategory[] = [];
  subCategories: SubCategory[] = []; // For modal - specific to selected category

  // UI state properties
  initialLoading = true;
  loading: boolean = true;
  categoriesLoading: boolean = true;
  subCategoriesLoading: boolean = false;
  error: string | null = null;
  searchTerm: string = '';

  // Modal properties
  showQuestionModal: boolean = false;
  showOptionModal: boolean = false;
  showOptionUpdateModal: boolean = false;
  isEditMode: boolean = false;
  currentQuestion: Question = this.getEmptyQuestion();
  currentOption: UpdateOption = this.getEmptyUpdateOption();
  modalLoading: boolean = false;
  selectedQuestionForOptions: Question | null = null;
  tempQuestionForOptions: Question | null = null;

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
  private apiUrl = `${environment.apiBaseUrl}/admin`;
  private categoryApiUrl = `${environment.apiBaseUrl}/admin/service-category-master`;
  private subCategoryApiUrl = `${environment.apiBaseUrl}/admin/sub-category-master`;

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
        this.categories = [];
        this.categoriesLoading = false;
        this.fetchQuestions();
        this.initialLoading = false; 
      }
    });
  }

  // Load subcategories based on selected category (for modal)
  loadSubCategories(categoryId: number): void {
    if (!categoryId) {
      this.subCategories = [];
      this.currentQuestion.subCategoryId = 0;
      return;
    }

    this.subCategoriesLoading = true;
    this.questionService.getSubCategoriesByCategory(categoryId).subscribe({
      next: (subCats) => {
        // Filter to show only active subcategories
        this.subCategories = subCats.filter(subCat => subCat.isActive);
        this.subCategoriesLoading = false;
        
        // Reset subcategory selection if current one is not in the list
        if (this.currentQuestion.subCategoryId && 
            !this.subCategories.find(sc => sc.id === this.currentQuestion.subCategoryId)) {
          this.currentQuestion.subCategoryId = 0;
        }
      },
      error: (err) => {
        console.error('Error fetching subcategories:', err);
        this.subCategories = [];
        this.subCategoriesLoading = false;
      }
    });
  }

  // Fetch individual subcategory by ID
  fetchSubCategoryById(subCategoryId: number): Observable<SubCategory | null> {
    if (!subCategoryId || subCategoryId === 0) {
      return of(null);
    }

    return this.http.get<SubCategory>(`${this.subCategoryApiUrl}/${subCategoryId}`)
      .pipe(
        catchError(err => {
          console.error(`Error fetching subcategory ${subCategoryId}:`, err);
          return of(null);
        })
      );
  }

  // Fetch and load all subcategories for questions
  loadSubCategoriesForQuestions(questions: Question[]): void {
    // Get unique subcategory IDs from questions
    const subCategoryIds = new Set<number>();
    
    questions.forEach(question => {
      if (question.subCategoryId && question.subCategoryId > 0) {
        subCategoryIds.add(question.subCategoryId);
      }
    });

    if (subCategoryIds.size === 0) {
      // No subcategories, set questions directly
      this.questions = questions.map(question => ({
        ...question,
        updating: false,
        deleting: false,
        subCategoryName: 'No Subcategory'
      })) as QuestionWithSubCategory[];
      
      this.filteredQuestions = [...this.questions];
      this.calculateStats();
      this.loading = false;
      return;
    }

    // Create an array of observables for fetching subcategories
    const subCategoryRequests: Observable<SubCategory | null>[] = [];
    subCategoryIds.forEach(id => {
      subCategoryRequests.push(this.fetchSubCategoryById(id));
    });

    // Fetch all subcategories in parallel
    forkJoin(subCategoryRequests).subscribe({
      next: (results) => {
        // Create a map of subcategory ID to name
        const subCategoryMap = new Map<number, string>();
        
        results.forEach(subCat => {
          if (subCat) {
            subCategoryMap.set(subCat.id, subCat.name);
          }
        });

        // Update questions with subcategory names
        this.questions = questions.map(question => ({
          ...question,
          updating: false,
          deleting: false,
          subCategoryName: question.subCategoryId && question.subCategoryId > 0 
            ? (subCategoryMap.get(question.subCategoryId) || 'Unknown Subcategory')
            : 'No Subcategory'
        })) as QuestionWithSubCategory[];

        this.filteredQuestions = [...this.questions];
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading subcategories:', err);
        // If there's an error, still set the questions without subcategory names
        this.questions = questions.map(question => ({
          ...question,
          updating: false,
          deleting: false,
          subCategoryName: 'Error loading'
        })) as QuestionWithSubCategory[];
        
        this.filteredQuestions = [...this.questions];
        this.calculateStats();
        this.loading = false;
      }
    });
  }

  // Get empty question template
  getEmptyQuestion(): Question {
    return {
      id: 0,
      categoryId: 0,
      subCategoryId: 0,
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
      isActive: true
    };
  }

  getEmptyUpdateOption(): UpdateOption {
    return {
      id: 0,
      questionId: 0,
      optionText: '',
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
      this.loadSubCategories(this.currentQuestion.categoryId);
    }
    
    this.showQuestionModal = true;
  }

  openOptionModal(question: Question): void {
    this.selectedQuestionForOptions = question;
    this.currentOption = {
      id: 0,
      questionId: question.id,
      optionText: '',
      isActive: true
    };
    this.showOptionModal = true;
  }

  openOptionUpdateModal(option: Option): void {
    this.currentOption = {
      id: option.id,
      questionId: option.questionId,
      optionText: option.optionText,
      isActive: option.isActive
    };
    this.showOptionUpdateModal = true;
    this.showOptionsModal = false;
  }

  editQuestion(question: Question): void {
    this.isEditMode = true;
    this.currentQuestion = { 
      ...question,
      updating: false,
      deleting: false 
    };
    
    // Load subcategories for the selected category
    this.loadSubCategories(question.categoryId);
    
    this.showQuestionModal = true;
  }

  closeQuestionModal(): void {
    this.showQuestionModal = false;
    this.currentQuestion = this.getEmptyQuestion();
    this.subCategories = [];
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
    this.questionOptions = this.questionOptions.map(opt => 
      opt.id === this.currentOption.id ? { ...opt, ...this.currentOption } : opt
    );

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
      subCategoryId: this.currentQuestion.subCategoryId || 0,
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
      subCategoryId: this.currentQuestion.subCategoryId || 0,
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
        // Load subcategories for all questions
        this.loadSubCategoriesForQuestions(data);
        this.initialLoading = false; 
      },
      error: (err) => {
        this.error = 'Failed to load questions. Please try again.';
        this.loading = false;
        this.initialLoading = false; 
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
      this.getCategoryName(question.categoryId).toLowerCase().includes(term) ||
      (question.subCategoryName && question.subCategoryName.toLowerCase().includes(term))
    );
  }

  refreshData(): void {
    this.fetchCategoriesAndQuestions();
    this.searchTerm = '';
  }

  toggleActive(question: Question): void {
    const newStatus = !question.isActive;

    question.updating = true;

    this.questionService.updateQuestion(question.id, {
      ...question,
      isActive: newStatus
    } as UpdateQuestion).subscribe({
      next: () => {
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
    question.deleting = true;

    this.questionService.deleteQuestion(question.id).subscribe({
      next: () => {
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

  getSubCategoryName(question: QuestionWithSubCategory): string {
    // Use the pre-loaded subCategoryName
    return question.subCategoryName || 'No Subcategory';
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
  }

  addAnotherOption(): void {
    this.tempQuestionForOptions = this.selectedQuestionForOptions;
    this.showOptionsModal = false;
    this.questionOptions = [];
    
    setTimeout(() => {
      if (this.tempQuestionForOptions) {
        this.openOptionModal(this.tempQuestionForOptions);
        this.tempQuestionForOptions = null;
      } else {
        console.error('No question found to add option to');
      }
    }, 300);
  }

  addOptionFromViewModal(): void {
    this.addAnotherOption();
  }

  editOption(option: Option): void {
    this.openOptionUpdateModal(option);
  }

  deleteOption(option: Option): void {
    if (confirm(`Are you sure you want to delete option "${option.optionText}"?`)) {
      option.deleting = true;
      
      this.questionService.deleteOption(option.id).subscribe({
        next: () => {
          this.questionOptions = this.questionOptions.filter(opt => opt.id !== option.id);
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

  // Category change handler
  onCategoryChange(): void {
    this.loadSubCategories(this.currentQuestion.categoryId);
    // Reset subcategory when category changes
    this.currentQuestion.subCategoryId = 0;
  }
}