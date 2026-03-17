import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SellerService } from '../business.service';

export interface Branch {
  id: number;
  name: string;
  businessId: number;
  isActive: boolean;
  line1: string | null;
  line2: string | null;
  pincode: string | null;
  cityName: string | null;
  stateName: string | null;
  areaName: string | null;
}

@Component({
  selector: 'app-branches',
  standalone: true,
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.css'],
  imports: [CommonModule, FormsModule] 
})
export class BranchesComponent implements OnInit {

  branches: Branch[] = [];
  isLoading = false;

  isModalOpen = false;
  editingBranch: Branch | null = null;

  // Form object for add/edit modal
  branchForm: Branch = {
    id: 0,
    name: '',
    businessId: 0,
    isActive: true,
    line1: null,
    line2: null,
    pincode: null,
    cityName: null,
    stateName: null,
    areaName: null,
  };
states: any[] = [];
cities: any[] = [];
areas: any[] = [];
  constructor(private businessService: SellerService) { }

  ngOnInit(): void {
    this.businessService.getStates().subscribe(states => this.states = states);
    this.loadBranches();
  }

  // 🔄 Load branches from backend dynamically
loadBranches() {
    this.isLoading = true;
    this.businessService.getBranches().subscribe({
      next: (data: Branch[]) => {
        this.branches = data; // ✅ TypeScript knows this is Branch[]
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
}
onStateChange(stateId: number) {
  this.branchForm.cityId = null;
  this.branchForm.areaId = null;
  this.cities = [];
  this.areas = [];
  if (!stateId) return;

  this.businessService.getCities(stateId).subscribe(cities => this.cities = cities);
}

onCityChange(cityId: number) {
  this.branchForm.areaId = null;
  this.areas = [];
  if (!cityId) return;

  this.businessService.getAreasByCity(cityId).subscribe(areas => this.areas = areas);
}
  // 🟢 Modal handlers
  openAddBranchModal() {
    this.isModalOpen = true;
    this.editingBranch = null;
    this.branchForm = {
      id: 0,
      name: '',
      businessId: 0,
      isActive: true,
      line1: null,
      line2: null,
      pincode: null,
      cityName: null,
      stateName: null,
      areaName: null
    };
  }

  openEditBranchModal(branch: Branch) {
    this.isModalOpen = true;
    this.editingBranch = branch;
    this.branchForm = { ...branch };
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // // 💾 Save branch (local state example)
 saveBranch() {
  if (this.editingBranch) {
    this.updateBranch(this.branchForm);
  } else {
    this.addBranch(this.branchForm);
  }
  this.closeModal();
}

  // // ❌ Delete branch (local state example)
  // deleteBranch(branch: Branch) {
  //   if (confirm(`Are you sure you want to delete ${branch.name}?`)) {
  //     this.branches = this.branches.filter(b => b.id !== branch.id);
  //   }
  // }
   addBranch(branch: Branch) {
    this.businessService.insertBranch(branch).subscribe(() => this.loadBranches());
  }

  updateBranch(branch: Branch) {
    this.businessService.updateBranch(branch).subscribe(() => this.loadBranches());
  }

deleteBranch(branch: Branch) {
  if (confirm(`Are you sure you want to delete ${branch.name}?`)) {
    this.businessService.deleteBranch(branch.id).subscribe({
      next: () => {
        // remove from local array
        this.branches = this.branches.filter(b => b.id !== branch.id);
      },
      error: err => console.error(err)
    });
  }
}
}