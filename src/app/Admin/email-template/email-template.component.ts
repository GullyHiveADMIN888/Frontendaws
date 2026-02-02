import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmailTemplateService, EmailTemplate } from './services/email-template.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.css']
})
export class EmailTemplateComponent implements OnInit, OnDestroy {
  templates: string[] = [];
  selectedTemplate: EmailTemplate | null = null;
  emailForm: FormGroup;
  isLoading = false;
  isLoadingTemplate = false;
  previewHtml = '';
  message = '';
  messageType: 'success' | 'error' = 'success';
  selectedFile: File | null = null;
  isUploading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private emailService: EmailTemplateService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.emailForm = this.createForm();
  }

  ngOnInit() {
    // Subscribe to template changes
    this.emailService.currentTemplate$
      .pipe(takeUntil(this.destroy$))
      .subscribe(template => {
        this.selectedTemplate = template;
        if (template && !template.isLoading) {
          this.updateFormWithTemplate(template);
        }
        this.isLoadingTemplate = template?.isLoading || false;
        this.updatePreview();
        this.cdr.detectChanges();
      });

    this.loadTemplates();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm(): FormGroup {
    return this.fb.group({
      templateName: ['']
    });
  }

  loadTemplates() {
    this.isLoading = true;
    this.emailService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.showMessage('Failed to load templates', 'error');
        this.isLoading = false;
      }
    });
  }

  onTemplateSelect(templateName: string) {
    console.log('Selected template:', templateName);
    if (!templateName) return;
    
    this.emailForm.patchValue({ templateName });
    this.emailService.getTemplate(templateName).subscribe();
  }

  updateFormWithTemplate(template: EmailTemplate) {
    if (!template) return;
    
    // Force update preview immediately
    this.updatePreview();
    this.cdr.detectChanges();
  }

  updatePreview() {
    // If no template or loading, show loading message
    if (!this.selectedTemplate) {
      this.previewHtml = '<em>No template selected</em>';
      return;
    }
    
    if (this.selectedTemplate.isLoading) {
      this.previewHtml = '<em>Loading template...</em>';
      return;
    }

    // If template has no content (error case), show error
    if (!this.selectedTemplate.content) {
      this.previewHtml = '<em>Unable to load template content</em>';
      return;
    }

    try {
      // Format for HTML display
      this.previewHtml = this.selectedTemplate.content.replace(/\n/g, '<br>');
    } catch (error) {
      console.error('Error generating preview:', error);
      this.previewHtml = '<em>Error generating preview</em>';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Check if file is .txt
      if (!file.name.toLowerCase().endsWith('.txt')) {
        this.showMessage('Please select a .txt file', 'error');
        event.target.value = ''; // Clear file input
        return;
      }
      
      this.selectedFile = file;
    }
  }

  updateTemplate() {
    if (!this.selectedTemplate) {
      this.showMessage('Please select a template first', 'error');
      return;
    }

    if (!this.selectedFile) {
      this.showMessage('Please select a .txt file to upload', 'error');
      return;
    }

    this.isUploading = true;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const newContent = e.target?.result as string;
        
        // Update the template content locally
        if (this.selectedTemplate) {
          this.selectedTemplate.content = newContent;
          
          // Extract variables from new content
          this.selectedTemplate.variables = this.emailService.extractVariables(newContent);
          
          // Update preview
          this.updatePreview();
          
          // Show success message
          this.showMessage('Template updated successfully!', 'success');
          
          // Call API to update template on server
          this.saveTemplateToServer();
        }
      } catch (error) {
        console.error('Error reading file:', error);
        this.showMessage('Error reading file content', 'error');
      } finally {
        this.isUploading = false;
        // Clear file input
        this.selectedFile = null;
        const fileInput = document.getElementById('templateFile') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
    };
    
    reader.onerror = () => {
      this.showMessage('Error reading file', 'error');
      this.isUploading = false;
      this.selectedFile = null;
    };
    
    reader.readAsText(this.selectedFile);
  }

  saveTemplateToServer() {
  if (!this.selectedTemplate) return;
  
  const updateData = {
    templateName: this.selectedTemplate.name,
    content: this.selectedTemplate.content
  };
  
  this.emailService.updateTemplate(updateData).subscribe({
    next: (response: any) => {
      console.log('Template saved to server:', response);
      this.showMessage(`Template "${this.selectedTemplate?.name}" updated successfully!`, 'success');
      
      // Refresh the template to get updated content
      if (this.selectedTemplate?.name) {
        this.emailService.getTemplate(this.selectedTemplate.name).subscribe();
      }
    },
    error: (error) => {
      console.error('Error saving template to server:', error);
      this.showMessage('Template updated locally but failed to save to server', 'error');
    }
  });
}

testTemplatePath() {
  if (this.selectedTemplate) {
    this.emailService.getTemplatePath(this.selectedTemplate.name).subscribe({
      next: (response) => {
        console.log('Template path:', response);
        alert(JSON.stringify(response, null, 2));
      }
    });
  }
}

// Call this method in updateTemplate() after updating locally

  showMessage(message: string, type: 'success' | 'error') {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  get variableControls() {
    return this.selectedTemplate?.variables || [];
  }

  getVariableLabel(variable: string): string {
    // Convert camelCase to Title Case
    const result = variable.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  downloadTemplate() {
    if (!this.selectedTemplate) {
      this.showMessage('Please select a template first', 'error');
      return;
    }

    // Create a blob with the template content
    const blob = new Blob([this.selectedTemplate.content], { type: 'text/plain' });
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.selectedTemplate.name}.txt`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}