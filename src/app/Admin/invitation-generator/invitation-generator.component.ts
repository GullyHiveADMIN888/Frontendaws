import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  EmployeeInvitationService,
  EmployeeInvitationResponse,
  GenerateInvitationDto,
  RegionDto
} from './service/employee-invitation.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-invitation-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [EmployeeInvitationService],
  templateUrl: './invitation-generator.component.html',
  styleUrls: []
})
export class InvitationGeneratorComponent implements OnInit {
  invitation: EmployeeInvitationResponse | null = null;
  isLoading = false;
  isSendingEmail = false;
  copySuccess = false;
  emailSent = false;
  emailSendingError = false;
  selectedRole = 'dispatcher';
  selectedRegion: RegionDto | null = null;
  emailAddress = '';
  showEmailForm = false;

  // Role options
  roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'dispatcher', label: 'Dispatcher' },
    { value: 'ops_manager', label: 'Operations Manager' },
    { value: 'viewer', label: 'Viewer' }
  ];

  // Region dropdown properties
  regions: RegionDto[] = [];
  regionSearchTerm: string = '';
  isRegionDropdownOpen = false;
  isLoadingRegions = false;
  private searchSubject = new Subject<string>();

  constructor(private invitationService: EmployeeInvitationService) { }

  ngOnInit(): void {
    // Setup region search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => {
        this.isLoadingRegions = true;
        return this.invitationService.getRegions(searchTerm, 20);
      })
    ).subscribe({
      next: (regions) => {
        this.regions = regions;
        this.isLoadingRegions = false;
      },
      error: (error) => {
        console.error('Error loading regions:', error);
        this.isLoadingRegions = false;
      }
    });

    // Load initial regions
    this.loadRegions();
  }

  loadRegions(searchTerm: string = ''): void {
    console.log('Loading regions with search term:', searchTerm);
    this.isLoadingRegions = true;
    this.invitationService.getRegions(searchTerm, 20).subscribe({
      next: (regions) => {
        console.log('Regions loaded:', JSON.stringify(regions, null, 2));
        this.regions = regions;
        this.isLoadingRegions = false;
      },
      error: (error) => {
        console.error('Error loading regions:', error);
        this.isLoadingRegions = false;
      }
    });
  }

  onRegionSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value;
    this.searchSubject.next(searchTerm);
  }

  // selectRegion(region: RegionDto): void {
  //   this.selectedRegion = region;
  //   this.regionSearchTerm = region.displayName || region.name;
  //   this.isRegionDropdownOpen = false;
  // }

  selectRegion(region: RegionDto): void {
    this.selectedRegion = region;
    // Format the display text to show region name with city in parentheses
    this.regionSearchTerm = `${region.name} (${region.cityName || 'No city'})`;
    this.isRegionDropdownOpen = false;
  }

  // Optional: Add a method to get formatted display for the input
  getRegionDisplayForInput(region: RegionDto | null): string {
    if (!region) return '';
    return `${region.name} (${region.cityName || 'No city'})`;
  }

  toggleRegionDropdown(): void {
    this.isRegionDropdownOpen = !this.isRegionDropdownOpen;
    if (this.isRegionDropdownOpen && this.regions.length === 0) {
      this.loadRegions();
    }
  }

  generateInvite(): void {
    this.isLoading = true;
    const dto: GenerateInvitationDto = {
      role: this.selectedRole,
      regionId: this.selectedRegion?.id
    };

    this.invitationService.generateInvitation(dto).subscribe({
      next: (response) => {
        this.invitation = response;
        this.isLoading = false;
        this.copySuccess = false;
        this.emailSent = false;
        this.showEmailForm = true;
        this.emailAddress = '';
      },
      error: (error) => {
        console.error('Error generating invitation:', error);
        this.isLoading = false;
        alert(error.error?.error || 'Failed to generate invitation. Please try again.');
      }
    });
  }

  sendEmail(): void {
    if (!this.invitation || !this.emailAddress) {
      alert('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.emailAddress)) {
      alert('Please enter a valid email address');
      return;
    }

    this.isSendingEmail = true;
    this.emailSendingError = false;

    this.invitationService.sendInvitationEmail(this.invitation.inviteToken, this.emailAddress).subscribe({
      next: (response) => {
        this.isSendingEmail = false;
        if (response.success) {
          this.emailSent = true;
          alert('Invitation email sent successfully!');
        } else {
          this.emailSendingError = true;
          alert(response.message || 'Failed to send email. Please try again.');
        }
      },
      error: (error) => {
        console.error('Error sending email:', error);
        this.isSendingEmail = false;
        this.emailSendingError = true;
        alert(error.error?.error || 'Failed to send email. Please try again.');
      }
    });
  }

  copyToClipboard(inputElement: HTMLInputElement): void {
    inputElement.select();
    document.execCommand('copy');
    this.copySuccess = true;

    setTimeout(() => {
      this.copySuccess = false;
    }, 3000);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'badge-pending';
      case 'accepted':
        return 'badge-accepted';
      case 'expired':
        return 'badge-expired';
      default:
        return 'badge-secondary';
    }
  }

  resetForm(): void {
    this.invitation = null;
    this.showEmailForm = false;
    this.emailAddress = '';
    this.emailSent = false;
    this.selectedRegion = null;
    this.regionSearchTerm = '';
    this.regions = [];
  }

  // Add this method to the component
  getRegionDisplayName(region: RegionDto): string {
    console.log('Getting display name for region:', JSON.stringify(region, null, 2));
    if (region.regionType === 'city') {
      // Show the region name (e.g., "Lucknow A") and optionally the city in parentheses
      return `${region.name} (${region.cityName || 'No city'})`;
    } else if (region.regionType === 'state') {
      return `${region.name} (State)`;
    } else {
      return `${region.name} (National)`;
    }
  }

  getRegionTypeLabel(regionType: string): string {
    switch (regionType) {
      case 'city':
        return 'City';
      case 'state':
        return 'State';
      case 'national':
        return 'National';
      default:
        return regionType;
    }
  }
}