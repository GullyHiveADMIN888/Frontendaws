import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SellerService } from '../business.service';
import { Branch } from '../models/branch.model';
import { NgForm } from '@angular/forms';


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
    cityId:null,
    stateId:null,
    areaId: null,
    areaIds: [], 
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
onStateChange(stateId: number | null | undefined) {
  if (!stateId) {
    this.cities = [];
    this.areas = [];
    this.branchForm.cityId = null;
    this.branchForm.areaId = null;
    return;
  }

  this.branchForm.cityId = null;
  this.branchForm.areaId = null;
  this.areas = [];
  
  this.businessService.getCitiess(stateId).subscribe(cities => this.cities = cities);
}

// onCityChange(cityId: number | null | undefined) {
//   if (!cityId) {
//     this.areas = [];
//     this.branchForm.areaId = null;
//     return;
//   }

//   this.branchForm.areaId = null;
//   this.businessService.getAreasByCity(cityId).subscribe(areas => this.areas = areas);
// }
  // 🟢 Modal handlers
onCityChange(cityId: number | null | undefined) {
  if (!cityId) {
    this.areas = [];
    this.branchForm.areaIds = []; // clear previous selections
    return;
  }

 this.businessService.getAreasByCity(cityId).subscribe(areas => {
  this.areas = areas.map(a => ({
    id: a.id,
    name: a.area_name
  }));
});
}
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
    areaName: null,

    cityId: null,
    stateId: null,
    areaIds: [], 
    areaId: null,
    businessName: null
  };
}

 openEditBranchModal(branch: Branch) {
  this.isModalOpen = true;
  this.editingBranch = branch;

  // Copy branch into form
  this.branchForm = { ...branch };

  // Load cities for the saved state
  if (branch.stateId) {
    this.businessService.getCitiess(branch.stateId).subscribe(cities => {
      this.cities = cities;

      // Ensure selected city exists in cities array
      if (branch.cityId) {
        this.branchForm.cityId = branch.cityId;

        // Load areas for the saved city
        this.businessService.getAreasByCity(branch.cityId!).subscribe(areas => {
          this.areas = areas;

          if (branch.areaId) {
            this.branchForm.areaId = branch.areaId;
          }
        });
      }
    });
  }
}

  closeModal() {
    this.isModalOpen = false;
  }


onSubmit(form: NgForm) {
  if (!this.branchForm.areaIds || this.branchForm.areaIds.length === 0) {
    alert('Please select at least one area.');
    const firstInvalid = document.querySelector('.ng-invalid') as HTMLElement;
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.focus();
    }
    return;
  }

  if (form.invalid) {
    const firstInvalid: HTMLElement = document.querySelector('.ng-invalid') as HTMLElement;
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.focus();
    }
    alert('Please fix the errors in the form before submitting.');
    return;
  }

  // All validations passed
  this.saveBranch();
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
allowNumbersOnly(event: KeyboardEvent) {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault(); // Prevent non-digit input
  }
}

// Open/close dropdown
dropdownOpen = false;
areaSearch = '';

// Return selected area objects
// selectedAreas(): { id: number; name: string }[] {
//   // ensure branchForm.areaIds exists
//   const selectedIds = this.branchForm.areaIds || [];
//   return this.areas.filter(a => selectedIds.includes(a.id));
// }
selectedAreas(): any[] {
  const selectedIds = this.branchForm.areaIds || [];
  return this.areas.filter(a => selectedIds.includes(a.id));
}
// Filter dropdown by search and remove already selected from visible options

// filteredAreas(): any[] {
//   const search = this.areaSearch?.toLowerCase() || '';
//   const selectedIds = this.branchForm.areaIds || [];

//   return this.areas.filter(
//     a =>
//       !selectedIds.includes(a.id) &&
//       a.area_name.toLowerCase().includes(search)
//   );
// }
filteredAreas(): any[] {
  const search = this.areaSearch?.toLowerCase() || '';
  const selectedIds = this.branchForm.areaIds || [];

  return this.areas.filter(
    a => a.area_name.toLowerCase().includes(search)
  );
}
isAllSelected(): boolean {
  return (
    this.areas.length > 0 &&
    this.branchForm.areaIds?.length === this.areas.length
  );
}
toggleSelectAll(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;

  if (checked) {
    // ✅ Select all
    this.branchForm.areaIds = this.areas.map(a => a.id);
  } else {
    // ❌ Unselect all
    this.branchForm.areaIds = [];
  }
}
toggleAreaSelection(area: { id: number; name: string }) {
  if (!this.branchForm.areaIds) this.branchForm.areaIds = [];
  
  const idx = this.branchForm.areaIds.indexOf(area.id);
  if (idx > -1) {
    this.branchForm.areaIds.splice(idx, 1);
  } else {
    this.branchForm.areaIds.push(area.id);
  }

  this.dropdownOpen = true;
  this.areaSearch = '';
}

removeArea(area: { id: number; name: string }, event: Event) {
  event.stopPropagation();
  if (!this.branchForm.areaIds) return;

  const idx = this.branchForm.areaIds.indexOf(area.id);
  if (idx > -1) this.branchForm.areaIds.splice(idx, 1);
}
}