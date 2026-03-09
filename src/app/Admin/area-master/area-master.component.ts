// area-master.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { AreaMasterService } from './services/area-master.service';
import { 
  AreaMaster, 
  AreaMasterCreateDto, 
  AreaMasterUpdateDto,
  StateDto,
  CityDto 
} from './models/area-master.model';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

@Component({
    selector: 'app-area-master',
    templateUrl: './area-master.component.html',
    styleUrls: ['./area-master.component.css'],
    standalone: false
})
export class AreaMasterComponent implements OnInit {
  @ViewChild('areaForm') areaForm!: NgForm;

  // Data properties
  areas: AreaMaster[] = [];
  filteredAreas: AreaMaster[] = [];
  states: StateDto[] = [];
  citiesForCurrentState: CityDto[] = [];
  citiesForState: CityDto[] = [];

  // Filter properties
  searchTerm: string = '';
  selectedStateId: number = 0;
  selectedCityId: number = 0;
  selectedStatus: string = 'all';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 25;
  totalCount: number = 0;
  totalPages: number = 0;
  pageSizes = [10, 25, 50, 100];

  // UI state properties
  loading: boolean = true;
  initialLoading = true;
  statesLoading: boolean = true;
  citiesLoading: boolean = false;
  filterLoading: boolean = false;
  error: string | null = null;

  // Modal properties
  showModal: boolean = false;
  isEditMode: boolean = false;
  currentArea: AreaMaster = this.getEmptyArea();
  modalLoading: boolean = false;

  // Stats properties
  totalAreas: number = 0;
  activeAreas: number = 0;
  uniquePincodes: number = 0;
  citiesCovered: number = 0;

  constructor(private areaMasterService: AreaMasterService) { }

  ngOnInit(): void {
    this.fetchData();
  }

  // =========== INITIALIZATION ===========
  getEmptyArea(): AreaMaster {
    return {
      id: 0,
      stateId: 0,
      cityId: 0,
      areaName: '',
      pincode: '',
      description: '',
      isActive: true,
      createdAt: '',
      updatedAt: '',
      updating: false,
      deleting: false
    };
  }

  fetchData(): void {
    this.loading = true;
    this.statesLoading = true;
    this.error = null;

    console.log('Fetching states...');
    this.areaMasterService.getStates().subscribe({
      next: (states) => {
        console.log('States loaded:', states.length);
        this.states = states.filter(state => state.isActive);
        this.statesLoading = false;
        this.loadPaginatedAreas();
      },
      error: (err) => {
        console.error('Error fetching states:', err);
        this.states = [];
        this.statesLoading = false;
        this.loadPaginatedAreas();
        
      }
    });
  }

  // =========== DATA LOADING ===========
  loadPaginatedAreas(): void {
    this.loading = true;
    console.log('Loading paginated areas, page:', this.currentPage, 'size:', this.pageSize);
    
    if (this.selectedCityId > 0) {
      console.log('Filtering by city ID:', this.selectedCityId);
      this.areaMasterService.getAreasByCityIdPaginated(
        this.selectedCityId, 
        this.currentPage, 
        this.pageSize
      ).subscribe({
        next: (response) => {
          this.handlePaginatedResponse(response);
        },
        error: (err) => {
          console.error('Error fetching paginated areas by city:', err);
          this.handleError();
        }
      });
    } else if (this.selectedStateId > 0) {
      console.log('Filtering by state ID:', this.selectedStateId);
      this.areaMasterService.getAreasByStateIdPaginated(
        this.selectedStateId, 
        this.currentPage, 
        this.pageSize
      ).subscribe({
        next: (response) => {
          this.handlePaginatedResponse(response);
        },
        error: (err) => {
          console.error('Error fetching paginated areas by state:', err);
          this.handleError();
        }
      });
    } else {
      const isActive = this.selectedStatus === 'all' ? undefined : (this.selectedStatus === 'active');
      console.log('Loading all areas with filters:', { 
        search: this.searchTerm, 
        isActive, 
        stateId: this.selectedStateId || undefined,
        cityId: this.selectedCityId || undefined
      });
      
      this.areaMasterService.getAllAreasPaginated(
        this.currentPage,
        this.pageSize,
        this.selectedStateId || undefined,
        this.selectedCityId || undefined,
        this.searchTerm || undefined,
        isActive
      ).subscribe({
        next: (response) => {
          this.handlePaginatedResponse(response);
        },
        error: (err) => {
          console.error('Error fetching paginated areas:', err);
          this.handleError();
        }
      });
    }
  }

  handlePaginatedResponse(response: { data: AreaMaster[], pagination: PaginationInfo }): void {
    console.log('Paginated response received:', response.data.length, 'items');
    this.areas = response.data.map(area => ({
      ...area,
      updating: false,
      deleting: false
    }));
    
    this.filteredAreas = [...this.areas];
    
    this.currentPage = response.pagination.page;
    this.pageSize = response.pagination.pageSize;
    this.totalCount = response.pagination.totalCount;
    this.totalPages = response.pagination.totalPages;
    
    this.calculateStats();
    this.loading = false;
    this.initialLoading = false;
    
    console.log('Pagination updated:', {
      currentPage: this.currentPage,
      totalCount: this.totalCount,
      totalPages: this.totalPages,
      itemsShown: this.filteredAreas.length
    });
  }

  handleError(): void {
    this.error = 'Failed to load areas. Please try again.';
    this.loading = false;
    this.areas = [];
    this.filteredAreas = [];
    this.totalCount = 0;
    this.totalPages = 0;
  }

  // =========== STATISTICS ===========
  calculateStats(): void {
    this.totalAreas = this.totalCount;
    this.activeAreas = this.areas.filter(area => area.isActive).length;
    
    const pincodes = new Set(this.areas.map(area => area.pincode));
    this.uniquePincodes = pincodes.size;
    
    const cities = new Set(this.areas.map(area => area.cityId));
    this.citiesCovered = cities.size;
  }

  // =========== FILTERS ===========
  filterAreas(): void {
    console.log('Filtering areas, resetting to page 1');
    this.currentPage = 1;
    this.loadPaginatedAreas();
  }

  onStateFilterChange(): void {
    console.log('State filter changed to:', this.selectedStateId);
    this.selectedCityId = 0;
    this.citiesForState = [];
    
    if (this.selectedStateId > 0) {
      this.citiesLoading = true;
      this.areaMasterService.getCitiesByStateId(this.selectedStateId).subscribe({
        next: (cities) => {
          console.log('Cities for state loaded:', cities.length);
          this.citiesForState = cities;
          this.citiesLoading = false;
          this.filterAreas();
        },
        error: (err) => {
          console.error('Error fetching cities:', err);
          this.citiesForState = [];
          this.citiesLoading = false;
          this.filterAreas();
        }
      });
    } else {
      this.filterAreas();
    }
  }

  onCityFilterChange(): void {
    console.log('City filter changed to:', this.selectedCityId);
    this.filterAreas();
  }

  refreshData(): void {
    console.log('Refreshing data...');
    this.searchTerm = '';
    this.selectedStateId = 0;
    this.selectedCityId = 0;
    this.selectedStatus = 'all';
    this.citiesForState = [];
    this.currentPage = 1;
    this.fetchData();
  }

  // =========== PAGINATION ===========
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      console.log('Going to page:', page);
      this.currentPage = page;
      this.loadPaginatedAreas();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      console.log('Going to next page');
      this.currentPage++;
      this.loadPaginatedAreas();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      console.log('Going to previous page');
      this.currentPage--;
      this.loadPaginatedAreas();
    }
  }

  changePageSize(size: number): void {
    console.log('Changing page size to:', size);
    this.pageSize = size;
    this.currentPage = 1;
    this.loadPaginatedAreas();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getEndIndex(): number {
    const end = this.currentPage * this.pageSize;
    return Math.min(end, this.totalCount);
  }

  // =========== MODAL METHODS ===========
  openAddModal(): void {
    console.log('Opening add modal');
    this.isEditMode = false;
    this.currentArea = this.getEmptyArea();
    this.citiesForCurrentState = [];
    this.showModal = true;
  }

  editArea(area: AreaMaster): void {
    console.log('Editing area:', area.id, area.areaName);
    this.isEditMode = true;
    this.currentArea = { ...area, updating: false, deleting: false };
    
    if (this.currentArea.stateId > 0) {
      this.loadCitiesForState(this.currentArea.stateId);
    }
    
    this.showModal = true;
  }

  closeModal(): void {
    console.log('Closing modal');
    this.showModal = false;
    this.currentArea = this.getEmptyArea();
    this.citiesForCurrentState = [];
    this.modalLoading = false;
    
    if (this.areaForm) {
      this.areaForm.resetForm();
    }
  }

  onStateChange(): void {
    console.log('State changed in modal to:', this.currentArea.stateId);
    if (this.currentArea.stateId > 0) {
      this.loadCitiesForState(this.currentArea.stateId);
      this.currentArea.cityId = 0;
    } else {
      this.citiesForCurrentState = [];
      this.currentArea.cityId = 0;
    }
  }

  loadCitiesForState(stateId: number): void {
    console.log('Loading cities for state:', stateId);
    this.citiesLoading = true;
    this.areaMasterService.getCitiesByStateId(stateId).subscribe({
      next: (cities) => {
        console.log('Cities loaded for modal:', cities.length);
        this.citiesForCurrentState = cities;
        this.citiesLoading = false;
      },
      error: (err) => {
        console.error('Error loading cities for modal:', err);
        this.citiesForCurrentState = [];
        this.citiesLoading = false;
      }
    });
  }

  // =========== DUPLICATE AREA VALIDATION ===========
  checkIfAreaExists(areaName: string, cityId: number, excludeId?: number): Observable<boolean> {
    return new Observable(observer => {
      // Get all areas for the city
      this.areaMasterService.getAreasByCityId(cityId).subscribe({
        next: (areas) => {
          const existingArea = areas.find(area => 
            area.areaName.toLowerCase() === areaName.toLowerCase() && 
            area.id !== excludeId
          );
          observer.next(!!existingArea);
          observer.complete();
        },
        error: (err) => {
          console.error('Error checking area existence:', err);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  // =========== SAVE OPERATIONS (WITH VALIDATION) ===========
  saveArea(): void {
    if (!this.validateArea()) return;

    const areaName = this.currentArea.areaName.trim();
    const cityId = this.currentArea.cityId;
    const excludeId = this.isEditMode ? this.currentArea.id : undefined;

    // Check if area already exists
    this.modalLoading = true;
    
    this.checkIfAreaExists(areaName, cityId, excludeId).subscribe({
      next: (exists) => {
        if (exists) {
          const cityName = this.citiesForCurrentState.find(c => c.id === cityId)?.name || 'selected city';
          this.showDuplicateAreaError(areaName, cityName);
          this.modalLoading = false;
          return;
        }
        
        // Continue with save
        if (this.isEditMode) {
          this.performUpdate();
        } else {
          this.performCreate();
        }
      },
      error: () => {
        // If validation fails, still try to save (backend will catch it)
        if (this.isEditMode) {
          this.performUpdate();
        } else {
          this.performCreate();
        }
      }
    });
  }

  private performCreate(): void {
    const createDto: AreaMasterCreateDto = {
      stateId: this.currentArea.stateId,
      cityId: this.currentArea.cityId,
      areaName: this.currentArea.areaName.trim(),
      pincode: this.currentArea.pincode.trim(),
      description: this.currentArea.description?.trim(),
      isActive: this.currentArea.isActive
    };

    console.log('Creating area with DTO:', createDto);
    this.areaMasterService.createArea(createDto).subscribe({
      next: (areaId) => {
        console.log('Area created successfully, ID:', areaId);
        this.showSuccess(`Area created successfully with ID: ${areaId}`);
        this.refreshAfterOperation();
      },
      error: (err) => {
        this.handleSaveError(err, 'create');
      }
    });
  }

  private performUpdate(): void {
    const updateDto: AreaMasterUpdateDto = {
      stateId: this.currentArea.stateId,
      cityId: this.currentArea.cityId,
      areaName: this.currentArea.areaName.trim(),
      pincode: this.currentArea.pincode.trim(),
      description: this.currentArea.description?.trim(),
      isActive: this.currentArea.isActive
    };

    console.log('Updating area ID:', this.currentArea.id, 'with DTO:', updateDto);
    this.areaMasterService.updateArea(this.currentArea.id, updateDto).subscribe({
      next: (success) => {
        console.log('Area updated successfully');
        this.showSuccess('Area updated successfully!');
        this.refreshAfterOperation();
      },
      error: (err) => {
        this.handleSaveError(err, 'update');
      }
    });
  }

  private handleSaveError(err: any, operation: string): void {
    console.error(`Error in ${operation}Area subscription:`, err);
    
    // Handle duplicate area error
    if (err.message && (
        err.message.toLowerCase().includes('area with this name already exists') ||
        err.message.toLowerCase().includes('duplicate') ||
        err.message.toLowerCase().includes('unique constraint') ||
        err.message.toLowerCase().includes('already exists')
    )) {
      const cityName = this.citiesForCurrentState.find(c => c.id === this.currentArea.cityId)?.name || 'selected city';
      this.showDuplicateAreaError(this.currentArea.areaName.trim(), cityName);
    } else if (err.message && err.message.includes('405')) {
      this.showError('Method not allowed. Please check API configuration.');
    } else if (err.message && err.message.includes('success')) {
      // If backend returns success as error (weird but possible)
      console.warn('Backend returned success as error:', err.message);
      this.showSuccess(`Area ${operation === 'create' ? 'created' : 'updated'} successfully!`);
      this.refreshAfterOperation();
      return;
    } else {
      this.showError(err.message || `Failed to ${operation} area. Please try again.`);
    }
    
    this.modalLoading = false;
  }

  private refreshAfterOperation(): void {
    console.log('Refreshing data after operation');
    
    // Reset to first page
    this.currentPage = 1;
    
    // Refresh the data
    this.loadPaginatedAreas();
    
    // Close modal after short delay to ensure data loads
    setTimeout(() => {
      this.closeModal();
    }, 500);
  }

  // =========== VALIDATION ===========
  validateArea(): boolean {
    if (!this.currentArea.areaName.trim()) {
      alert('Area name is required!');
      return false;
    }

    if (!this.currentArea.stateId) {
      alert('Please select a state!');
      return false;
    }

    if (!this.currentArea.cityId) {
      alert('Please select a city!');
      return false;
    }

    if (!this.currentArea.pincode.trim()) {
      alert('Pincode is required!');
      return false;
    }

    if (!/^\d{6}$/.test(this.currentArea.pincode.trim())) {
      alert('Pincode must be exactly 6 digits!');
      return false;
    }

    return true;
  }

  // =========== STATUS TOGGLE ===========
  toggleActive(area: AreaMaster): void {
    const newStatus = !area.isActive;
    console.log('Toggling area', area.id, 'from', area.isActive, 'to', newStatus);
    
    area.updating = true;

    const updateDto: AreaMasterUpdateDto = {
      stateId: area.stateId,
      cityId: area.cityId,
      areaName: area.areaName,
      pincode: area.pincode,
      description: area.description,
      isActive: newStatus
    };

    this.areaMasterService.updateArea(area.id, updateDto).subscribe({
      next: () => {
        console.log('Area status updated successfully');
        area.isActive = newStatus;
        area.updating = false;
        this.calculateStats();
      },
      error: (err) => {
        console.error('Error updating area status:', err);
        area.updating = false;
        alert('Failed to update area status');
      }
    });
  }

  // =========== DELETE ===========
  confirmDelete(area: AreaMaster): void {
    if (confirm(`Are you sure you want to delete "${area.areaName}"? This action cannot be undone.`)) {
      this.deleteArea(area);
    }
  }

  deleteArea(area: AreaMaster): void {
    console.log('Deleting area:', area.id);
    area.deleting = true;

    this.areaMasterService.deleteArea(area.id).subscribe({
      next: () => {
        console.log('Area deleted successfully');
        this.loadPaginatedAreas();
      },
      error: (err) => {
        console.error('Error deleting area:', err);
        area.deleting = false;
        alert(err.message || 'Failed to delete area');
      }
    });
  }

  // =========== UTILITIES ===========
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  }

  getStateName(stateId: number): string {
    const state = this.states.find(s => s.id === stateId);
    return state ? state.name : `State #${stateId}`;
  }

  // =========== MESSAGE HELPERS ===========
  private showSuccess(message: string): void {
    alert(message);
  }

  private showError(message: string): void {
    alert('Error: ' + message);
  }

  private showDuplicateAreaError(areaName: string, cityName: string): void {
    alert(`Error: An area with name "${areaName}" already exists in ${cityName}. Please use a different area name.`);
  }
}