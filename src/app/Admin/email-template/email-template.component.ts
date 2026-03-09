import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmailTemplateService, EmailTemplate, TemplatePathInfo, UpdateTemplateResponse } from './services/email-template.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-email-template',
    templateUrl: './email-template.component.html',
    styleUrls: ['./email-template.component.css'],
    standalone: false
})
export class EmailTemplateComponent implements OnInit, OnDestroy {
  templates: string[] = [];
  selectedTemplate: EmailTemplate | null = null;
  emailForm: FormGroup;
  isLoading = false;
  initialLoading = true;
  isLoadingTemplate = false;
  previewHtml = '';
  message = '';
  messageType: 'success' | 'error' = 'success';
  selectedFile: File | null = null;
  isUploading = false;
  templatePathInfo: TemplatePathInfo | null = null;
  showPathInfo = false;
  
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
    this.loadTemplateDirectoryInfo();
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
        this.initialLoading = false; 

        console.log('Loaded templates:', templates);
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.showMessage('Failed to load templates', 'error');
        this.isLoading = false;
        this.initialLoading = false;
      }
    });
  }

  loadTemplateDirectoryInfo() {
    this.emailService.getTemplateDirectory().subscribe({
      next: (info) => {
        this.templatePathInfo = info;
        console.log('Template directory info:', info);
      },
      error: (error) => {
        console.error('Error loading directory info:', error);
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
    
    // Update preview
    this.updatePreview();
    this.cdr.detectChanges();
  }

  updatePreview() {
    // If no template or loading, show loading message
    if (!this.selectedTemplate) {
      this.previewHtml = '<div class="no-content"><em>No template selected</em></div>';
      return;
    }
    
    if (this.selectedTemplate.isLoading) {
      this.previewHtml = '<div class="loading-content"><em>Loading template...</em></div>';
      return;
    }

    // If template has no content (error case), show error
    if (!this.selectedTemplate.content) {
      this.previewHtml = '<div class="error-content"><em>Unable to load template content</em></div>';
      return;
    }

    try {
      // Format for HTML display with variable highlighting
      let content = this.selectedTemplate.content;
      
      // Replace newlines with <br>
      content = content.replace(/\n/g, '<br>');
      
      // Highlight variables
      content = content.replace(/\{\{(\w+)\}\}/g, '<span class="variable-highlight">{{$1}}</span>');
      
      this.previewHtml = content;
    } catch (error) {
      console.error('Error generating preview:', error);
      this.previewHtml = '<div class="error-content"><em>Error generating preview</em></div>';
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
      console.log('File selected:', file.name);
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
        
        // Update the template content locally first
        this.emailService.updateCurrentTemplateLocally(newContent);
        
        // Update preview
        this.updatePreview();
        
        // Show temporary success message
        this.showMessage('Template updated locally, saving to server...', 'success');
        
        // Call API to update template on server
        this.saveTemplateToServer(newContent);
      } catch (error) {
        console.error('Error reading file:', error);
        this.showMessage('Error reading file content', 'error');
        this.isUploading = false;
      }
    };
    
    reader.onerror = () => {
      this.showMessage('Error reading file', 'error');
      this.isUploading = false;
      this.selectedFile = null;
    };
    
    reader.readAsText(this.selectedFile);
  }

  saveTemplateToServer(newContent: string) {
    // Add null check for selectedTemplate
    if (!this.selectedTemplate || !this.selectedTemplate.name) {
      this.showMessage('No template selected', 'error');
      this.isUploading = false;
      return;
    }
    
    const updateData = {
      templateName: this.selectedTemplate.name,
      content: newContent
    };
    
    this.emailService.updateTemplate(updateData).subscribe({
      next: (response: UpdateTemplateResponse) => {
        console.log('Template saved to server:', response);
        this.showMessage(`Template "${this.selectedTemplate?.name}" updated successfully!`, 'success');
        
        // Reload the template to ensure we have latest from server
        if (this.selectedTemplate?.name) {
          this.emailService.reloadTemplate(this.selectedTemplate.name).subscribe({
            next: () => {
              // Now get fresh content from server
              setTimeout(() => {
                this.emailService.refreshCurrentTemplate();
              }, 500);
            },
            error: (reloadError) => {
              console.warn('Warning: Could not reload template:', reloadError);
              // Still show success since file was saved
            }
          });
        }
        
        // Clear file input
        this.selectedFile = null;
        const fileInput = document.getElementById('templateFile') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      },
      error: (error) => {
        console.error('Error saving template to server:', error);
        this.showMessage(`Failed to save template to server: ${error.message}`, 'error');
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }

  clearTemplateCache() {
    this.emailService.clearCache().subscribe({
      next: () => {
        this.showMessage('Template cache cleared successfully', 'success');
        // Reload current template
        if (this.selectedTemplate?.name) {
          this.emailService.refreshCurrentTemplate();
        }
      },
      error: (error) => {
        this.showMessage(`Failed to clear cache: ${error.message}`, 'error');
      }
    });
  }

  reloadCurrentTemplate() {
    // Add null check
    if (!this.selectedTemplate?.name) {
      this.showMessage('Please select a template first', 'error');
      return;
    }
    
    this.emailService.reloadTemplate(this.selectedTemplate.name).subscribe({
      next: () => {
        this.showMessage('Template reloaded from server', 'success');
        this.emailService.refreshCurrentTemplate();
      },
      error: (error) => {
        this.showMessage(`Failed to reload template: ${error.message}`, 'error');
      }
    });
  }

  togglePathInfo() {
    this.showPathInfo = !this.showPathInfo;
    if (this.showPathInfo && !this.templatePathInfo) {
      this.loadTemplateDirectoryInfo();
    }
  }

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

  // Helper method to safely access selectedTemplate properties
  get selectedTemplateName(): string {
    return this.selectedTemplate?.name || '';
  }

  get isTemplateSelected(): boolean {
    return !!this.selectedTemplate && !!this.selectedTemplate.name;
  }
}