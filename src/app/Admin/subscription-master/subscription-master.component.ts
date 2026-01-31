import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface SubscriptionPlan {
  id: number;
  subject: string;
  tier: string;
  code: string;
  name: string;
  description?: string;
  price_amount: number;
  currency: string;
  duration_days: number;
  city_id?: number;
  category_id?: number;
  entitlements: any; // JSON object
  is_active: boolean;
}

@Component({
  selector: 'app-subscription-master',
  templateUrl: './subscription-master.component.html',
  styleUrls: ['./subscription-master.component.css']
})
export class SubscriptionMasterComponent implements OnInit {
  // Stats
  totalPlans: number = 0;
  activePlans: number = 0;
  uniqueTiers: number = 0;
  totalCategories: number = 0;

  // Data
  subscriptions: SubscriptionPlan[] = [];
  filteredSubscriptions: SubscriptionPlan[] = [];
  
  // UI State
  loading: boolean = true;
  showModal: boolean = false;
  editingPlan: SubscriptionPlan | null = null;
  searchTerm: string = '';

  // Form
  planForm: FormGroup;

  // Sample data for demo (remove when backend is implemented)
  private sampleData: SubscriptionPlan[] = [
    {
      id: 1,
      subject: 'LEAD_GENERATION',
      tier: 'BASIC',
      code: 'BASIC_MONTHLY',
      name: 'Basic Monthly Lead Generation',
      description: 'Basic lead generation plan with limited features',
      price_amount: 299.00,
      currency: 'INR',
      duration_days: 30,
      city_id: 1,
      category_id: 1,
      entitlements: {
        max_leads: 100,
        max_users: 2,
        features: ['basic_analytics', 'email_support']
      },
      is_active: true
    },
    {
      id: 2,
      subject: 'LEAD_MANAGEMENT',
      tier: 'STANDARD',
      code: 'STANDARD_QUARTERLY',
      name: 'Standard Quarterly Plan',
      description: 'Standard lead management plan with moderate features',
      price_amount: 799.00,
      currency: 'INR',
      duration_days: 90,
      city_id: 0,
      category_id: 2,
      entitlements: {
        max_leads: 500,
        max_users: 5,
        features: ['advanced_analytics', 'phone_support', 'crm_integration']
      },
      is_active: true
    },
    {
      id: 3,
      subject: 'ANALYTICS',
      tier: 'PREMIUM',
      code: 'PREMIUM_YEARLY',
      name: 'Premium Analytics Package',
      description: 'Premium analytics with AI-powered insights',
      price_amount: 4999.00,
      currency: 'INR',
      duration_days: 365,
      city_id: 2,
      category_id: 0,
      entitlements: {
        max_leads: 5000,
        max_users: 10,
        features: ['ai_insights', 'priority_support', 'custom_reports', 'api_access']
      },
      is_active: false
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.planForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadSubscriptions();
    this.calculateStats();
  }

  createForm(): FormGroup {
    return this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      subject: ['', Validators.required],
      tier: ['', Validators.required],
      description: [''],
      price_amount: [0, [Validators.required, Validators.min(0)]],
      currency: ['INR', Validators.required],
      duration_days: [30, [Validators.required, Validators.min(1)]],
      city_id: [null],
      category_id: [null],
      entitlements: ['{}', [Validators.required, this.jsonValidator]],
      is_active: [true]
    });
  }

  // JSON Validator
  jsonValidator(control: any) {
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  // Load subscription plans
  loadSubscriptions(): void {
    this.loading = true;
    // TODO: Replace with actual API call
    setTimeout(() => {
      this.subscriptions = [...this.sampleData];
      this.filteredSubscriptions = [...this.subscriptions];
      this.loading = false;
      this.calculateStats();
    }, 1000);
  }

  // Calculate stats
  calculateStats(): void {
    this.totalPlans = this.subscriptions.length;
    this.activePlans = this.subscriptions.filter(plan => plan.is_active).length;
    
    const uniqueTiers = new Set(this.subscriptions.map(plan => plan.tier));
    this.uniqueTiers = uniqueTiers.size;
    
    const categories = this.subscriptions.filter(plan => plan.category_id).length;
    this.totalCategories = categories;
  }

  // Search functionality
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSubscriptions = [...this.subscriptions];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredSubscriptions = this.subscriptions.filter(plan =>
      plan.code.toLowerCase().includes(term) ||
      plan.name.toLowerCase().includes(term) ||
      plan.description?.toLowerCase().includes(term) ||
      plan.subject.toLowerCase().includes(term) ||
      plan.tier.toLowerCase().includes(term)
    );
  }

  // Modal operations
  openAddModal(): void {
    this.editingPlan = null;
    this.planForm.reset({
      code: '',
      name: '',
      subject: '',
      tier: '',
      description: '',
      price_amount: 0,
      currency: 'INR',
      duration_days: 30,
      city_id: null,
      category_id: null,
      entitlements: '{}',
      is_active: true
    });
    this.showModal = true;
  }

  editPlan(plan: SubscriptionPlan): void {
    this.editingPlan = { ...plan };
    this.planForm.patchValue({
      ...plan,
      entitlements: JSON.stringify(plan.entitlements, null, 2)
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingPlan = null;
  }

  // Save plan (create or update)
  savePlan(): void {
    if (this.planForm.invalid) {
      this.markFormGroupTouched(this.planForm);
      return;
    }

    const formData = this.planForm.value;
    const planData: SubscriptionPlan = {
      ...formData,
      id: this.editingPlan ? this.editingPlan.id : this.generateId(),
      entitlements: JSON.parse(formData.entitlements)
    };

    if (this.editingPlan) {
      // Update existing plan
      const index = this.subscriptions.findIndex(p => p.id === this.editingPlan!.id);
      if (index !== -1) {
        this.subscriptions[index] = planData;
      }
    } else {
      // Add new plan
      this.subscriptions.unshift(planData);
    }

    this.filteredSubscriptions = [...this.subscriptions];
    this.calculateStats();
    this.closeModal();
    
    // TODO: Call API to save data
    console.log('Saving plan:', planData);
  }

  // Generate unique ID (temporary)
  private generateId(): number {
    const maxId = Math.max(...this.subscriptions.map(p => p.id), 0);
    return maxId + 1;
  }

  // Toggle plan status
  togglePlanStatus(plan: SubscriptionPlan): void {
    if (confirm(`Are you sure you want to ${plan.is_active ? 'deactivate' : 'activate'} this plan?`)) {
      plan.is_active = !plan.is_active;
      
      // TODO: Call API to update status
      console.log('Toggling plan status:', plan);
      this.calculateStats();
    }
  }

  // View plan details
  viewDetails(plan: SubscriptionPlan): void {
    // TODO: Implement detailed view or modal
    console.log('Viewing plan details:', plan);
    
    // For now, show an alert with details
    alert(`
Plan: ${plan.name}
Code: ${plan.code}
Subject: ${plan.subject}
Tier: ${plan.tier}
Price: ${plan.currency} ${plan.price_amount}
Duration: ${plan.duration_days} days
Status: ${plan.is_active ? 'Active' : 'Inactive'}
Description: ${plan.description}
Entitlements: ${JSON.stringify(plan.entitlements, null, 2)}
    `);
  }

  // Delete plan
  deletePlan(plan: SubscriptionPlan): void {
    if (confirm(`Are you sure you want to delete plan "${plan.name}"? This action cannot be undone.`)) {
      const index = this.subscriptions.findIndex(p => p.id === plan.id);
      if (index !== -1) {
        this.subscriptions.splice(index, 1);
        this.filteredSubscriptions = [...this.subscriptions];
        this.calculateStats();
        
        // TODO: Call API to delete
        console.log('Deleting plan:', plan);
      }
    }
  }

  // Helper to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}