import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SellerService } from '../business.service';
import { Branch } from '../models/branch.model';
import { NgForm } from '@angular/forms';
import { HostListener } from '@angular/core';



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
    cityId: null,
    stateId: null,
    areaId: null,
    areaIds: [],
    addressId: null,
  };
  states: any[] = [];
  cities: any[] = [];
  areas: any[] = [];
  currentPage = 1;
pageSize = 10;
totalCount = 0;
totalPages = 0;

  constructor(private businessService: SellerService) { }

  ngOnInit(): void {
    this.businessService.getStates().subscribe(states => this.states = states);
    this.loadBranches();
  }



  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;

    if (this.dropdownOpen) {
      this.areaSearch = '';
    }
  }
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const clickedInside = (event.target as HTMLElement)
      .closest('.relative');

    if (!clickedInside) {
      this.dropdownOpen = false;
    }
  }


  // //  Load branches from backend dynamically
  // loadBranches() {
  //   this.isLoading = true;
  //   this.businessService.getBranches().subscribe({
  //     next: (data: Branch[]) => {
  //       this.branches = data; // ✅ TypeScript knows this is Branch[]
  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       this.isLoading = false;
  //     }
  //   });
  // }
  loadBranches(page: number = 1) {
  this.isLoading = true;
  this.currentPage = page;

  this.businessService.getBranches(this.currentPage, this.pageSize).subscribe({
    next: (res) => {
      this.branches = res.items;
      this.totalCount = res.totalCount;
      this.totalPages = Math.ceil(this.totalCount / this.pageSize);
      this.isLoading = false;
    },
    error: (err) => {
      console.error(err);
      this.isLoading = false;
    }
  });
}
// Go to previous page
prevPage() {
  if (this.currentPage > 1) {
    this.loadBranches(this.currentPage - 1);
  }
}

// Go to next page
nextPage() {
  if (this.currentPage < this.totalPages) {
    this.loadBranches(this.currentPage + 1);
  }
}

// Jump to specific page
goToPage(page: number) {
  if (page >= 1 && page <= this.totalPages) {
    this.loadBranches(page);
  }
}

// Generate array of page numbers for template
get pages(): number[] {
  return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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

      // If editing, pre-select the existing areaIds
      if (this.editingBranch?.areaIds) {
        this.branchForm.areaIds = [...this.editingBranch.areaIds];
      }
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
            this.areas = areas.map(a => ({
              id: a.id,
              name: a.area_name
            }));

            // 🔹 IMPORTANT: Map selected AreaIds
            if (branch.areaIds && branch.areaIds.length) {
              this.branchForm.areaIds = [...branch.areaIds];
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
  //   Save branch (local state example)

  // saveBranch() {
  //   const payload: any = {
  //     Id: this.branchForm.id || null,
  //     Name: this.branchForm.name?.trim() || "",
  //     BusinessId: this.branchForm.businessId || null,
  //     IsActive: this.branchForm.isActive,
  //     AddressId: this.branchForm.addressId || null,
  //     Line1: this.branchForm.line1 || "",
  //     Line2: this.branchForm.line2 || "",
  //     Pincode: this.branchForm.pincode || "",
  //     CityId: this.branchForm.cityId || null,
  //     StateId: this.branchForm.stateId || null,
  //     AreaIds: this.branchForm.areaIds?.length ? this.branchForm.areaIds : [],
  //   };

  //   console.log('Sending payload:', JSON.stringify(payload));

  //   if (this.editingBranch) {
  //     this.businessService.updateBranch(payload).subscribe(() => this.loadBranches());
  //   } else {
  //     this.businessService.insertBranch(payload).subscribe(() => this.loadBranches());
  //   }
  //   this.closeModal();
  // }
  saveBranch() {
    const payload: any = {
      Id: this.branchForm.id || null,
      Name: this.branchForm.name?.trim() || "",
      BusinessId: this.branchForm.businessId || null,
      IsActive: this.branchForm.isActive,
      AddressId: this.branchForm.addressId || null,
      Line1: this.branchForm.line1 || "",
      Line2: this.branchForm.line2 || "", 
      Pincode: this.branchForm.pincode || "",
      CityId: this.branchForm.cityId || null,
      StateId: this.branchForm.stateId || null,
      AreaIds: this.branchForm.areaIds?.length ? this.branchForm.areaIds : [],
    };

    this.isLoading = true;

    const request = this.editingBranch
      ? this.businessService.updateBranch(payload)
      : this.businessService.insertBranch(payload);

    request.subscribe({
      next: (res: any) => {
        this.isLoading = false;

        // ✅ SUCCESS ALERT
        alert(res?.message || 'Branch saved successfully');

        this.loadBranches();
        this.closeModal();
      },
      error: (err) => {
        this.isLoading = false;

        //  ERROR ALERT
        const errorMessage =
          err?.error?.message || 'Something went wrong';

        alert(errorMessage);

        console.error('Insert error:', err);
      }
    });
  }
  // addBranch(branch: Branch) {
  //   this.businessService.insertBranch(branch).subscribe(() => this.loadBranches());
  // }

  // updateBranch(branch: Branch) {
  //   this.businessService.updateBranch(branch).subscribe(() => this.loadBranches());
  // }

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


  selectedAreas(): any[] {
    const selectedIds = this.branchForm.areaIds || [];
    return this.areas.filter(a => selectedIds.includes(a.id));
  }

  filteredAreas(): any[] {
    const search = this.areaSearch?.toLowerCase() || '';

    return this.areas.filter(a =>
      a.name.toLowerCase().includes(search)
    );
  }


  isAllSelected(): boolean {
    return this.branchForm.areaIds?.length === this.areas.length;
  }

  onSelectAll(event: any) {
    if (event.target.checked) {
      this.branchForm.areaIds = this.areas.map(a => a.id);
    } else {
      this.branchForm.areaIds = [];
    }
    this.areaSearch = '';
  }

  toggleAreaSelection(area: any) {
    if (!this.branchForm.areaIds) this.branchForm.areaIds = [];

    const index = this.branchForm.areaIds.indexOf(area.id);

    if (index > -1) {
      this.branchForm.areaIds.splice(index, 1);
    } else {
      this.branchForm.areaIds.push(area.id);
    }

    this.areaSearch = '';

  }

  removeArea(area: { id: number; name: string }, event: Event) {
    event.stopPropagation();
    if (!this.branchForm.areaIds) return;

    const idx = this.branchForm.areaIds.indexOf(area.id);
    if (idx > -1) this.branchForm.areaIds.splice(idx, 1);
  }
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';

  showAlert(message: string, type: 'success' | 'error') {
    this.alertMessage = message;
    this.alertType = type;

    setTimeout(() => {
      this.alertMessage = '';
    }, 3000);
  }
}