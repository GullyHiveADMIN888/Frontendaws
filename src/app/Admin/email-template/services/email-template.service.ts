import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.prod';

export interface EmailTemplate {
    name: string;
    content: string;
    variables: string[];
    isLoading?: boolean;
}

export interface EmailData {
    templateName: string;
    toEmail: string;
    subject: string;
    variables: { [key: string]: string };
}

export interface TemplatePathInfo {
    directoryPath: string;
    exists: boolean;
    files: string[];
}

export interface UpdateTemplateResponse {
    success: boolean;
    message: string;
    path: string;
}

@Injectable({
    providedIn: 'root'
})
export class EmailTemplateService {
    private apiUrl = `${environment.apiBaseUrl}/email`;
    private currentTemplateSubject = new BehaviorSubject<EmailTemplate | null>(null);
    public currentTemplate$ = this.currentTemplateSubject.asObservable();

    constructor(private http: HttpClient) { }

    // Get all available templates
    getTemplates(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/templates`).pipe(
            catchError(error => {
                console.error('Error loading templates:', error);
                return of([]);
            })
        );
    }

    // Get specific template content with proper loading state
    getTemplate(templateName: string): Observable<EmailTemplate> {
        // Show loading state
        const loadingTemplate: EmailTemplate = {
            name: templateName,
            content: '',
            variables: [],
            isLoading: true
        };
        this.currentTemplateSubject.next(loadingTemplate);
        
        console.log(`Loading template: ${templateName}`);
        return this.http.get<{name: string, content: string, variables: string[]}>(`${this.apiUrl}/templates/${templateName}`).pipe(
            tap(response => {
                const template: EmailTemplate = {
                    name: response.name,
                    content: response.content,
                    variables: response.variables || [],
                    isLoading: false
                };
                this.currentTemplateSubject.next(template);
            }),
            map(response => ({
                name: response.name,
                content: response.content,
                variables: response.variables || [],
                isLoading: false
            })),
            catchError(error => {
                console.error('Error loading template:', error);
                const errorTemplate: EmailTemplate = {
                    name: templateName,
                    content: `Error loading template: ${error.message}`,
                    variables: [],
                    isLoading: false
                };
                this.currentTemplateSubject.next(errorTemplate);
                return of(errorTemplate);
            })
        );
    }

    // Update template content
    updateTemplate(updateData: { templateName: string; content: string }): Observable<UpdateTemplateResponse> {
        return this.http.put<UpdateTemplateResponse>(`${this.apiUrl}/update`, updateData).pipe(
            tap(response => {
                console.log('Template update response:', response);
            }),
            catchError(error => {
                console.error('Error updating template:', error);
                throw error;
            })
        );
    }

    // Get template directory information
    getTemplateDirectory(): Observable<TemplatePathInfo> {
        return this.http.get<TemplatePathInfo>(`${this.apiUrl}/templates-directory`).pipe(
            catchError(error => {
                console.error('Error getting template directory:', error);
                return of({
                    directoryPath: 'Unknown',
                    exists: false,
                    files: []
                });
            })
        );
    }

    // Clear template cache
    clearCache(): Observable<any> {
        return this.http.post(`${this.apiUrl}/clear-cache`, {}).pipe(
            tap(() => console.log('Template cache cleared')),
            catchError(error => {
                console.error('Error clearing cache:', error);
                throw error;
            })
        );
    }

    // Reload specific template
    reloadTemplate(templateName: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/reload/${templateName}`, {}).pipe(
            tap(() => console.log(`Template ${templateName} reloaded`)),
            catchError(error => {
                console.error('Error reloading template:', error);
                throw error;
            })
        );
    }

    // Send test email
    sendTestEmail(emailData: EmailData): Observable<any> {
        return this.http.post(`${this.apiUrl}/send`, emailData).pipe(
            catchError(error => {
                console.error('Error sending test email:', error);
                throw error;
            })
        );
    }

    // Extract variables from template content (client-side fallback)
    extractVariables(content: string): string[] {
        if (!content) return [];
        const regex = /\{\{(\w+)\}\}/g;
        const variables: string[] = [];
        let match;

        while ((match = regex.exec(content)) !== null) {
            if (!variables.includes(match[1])) {
                variables.push(match[1]);
            }
        }

        return variables;
    }

    // Preview template with variables
    previewTemplate(templateContent: string, variables: { [key: string]: string }): string {
        if (!templateContent) return '';

        let preview = templateContent;

        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            preview = preview.replace(regex, variables[key] || `{{${key}}}`);
        });

        // Format for HTML display
        preview = preview.replace(/\n/g, '<br>');
        
        // Highlight variables
        preview = preview.replace(/\{\{(\w+)\}\}/g, '<span class="variable-highlight">{{$1}}</span>');
        
        return preview;
    }

    // Get current template (for immediate access)
    getCurrentTemplate(): EmailTemplate | null {
        return this.currentTemplateSubject.value;
    }

    // Update current template locally (before saving to server)
    updateCurrentTemplateLocally(content: string): void {
        const current = this.currentTemplateSubject.value;
        if (current) {
            const updated: EmailTemplate = {
                ...current,
                content: content,
                variables: this.extractVariables(content)
            };
            this.currentTemplateSubject.next(updated);
        }
    }

    // Refresh current template from server
    refreshCurrentTemplate(): void {
        const current = this.currentTemplateSubject.value;
        if (current && current.name) {
            this.getTemplate(current.name).subscribe();
        }
    }
}