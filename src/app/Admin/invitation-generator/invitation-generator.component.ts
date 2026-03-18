import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  EmployeeInvitationService, 
  EmployeeInvitationResponse,
  GenerateInvitationDto 
} from './service/employee-invitation.service';

@Component({
  selector: 'app-invitation-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [EmployeeInvitationService],
  templateUrl: './invitation-generator.component.html',
  styleUrls: ['./invitation-generator.component.css']
})
export class InvitationGeneratorComponent {
  invitation: EmployeeInvitationResponse | null = null;
  isLoading = false;
  isSendingEmail = false;
  copySuccess = false;
  emailSent = false;
  emailSendingError = false;
  selectedRole = 'member';
  emailAddress = '';
  showEmailForm = false;

  constructor(private invitationService: EmployeeInvitationService) {}

  generateInvite(): void {
    this.isLoading = true;
    const dto: GenerateInvitationDto = {
      role: this.selectedRole
      // Don't include email here
    };

    this.invitationService.generateInvitation(dto).subscribe({
      next: (response) => {
        this.invitation = response;
        this.isLoading = false;
        this.copySuccess = false;
        this.emailSent = false;
        this.showEmailForm = true; // Show email form after link generation
        this.emailAddress = ''; // Clear previous email
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

    // Validate email format
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
  }
}