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
        return this.http.get<string[]>(`${this.apiUrl}/templates`);
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
        return this.http.get<EmailTemplate>(`${this.apiUrl}/templates/${templateName}`).pipe(
            tap(template => {
                template.isLoading = false;
                this.currentTemplateSubject.next(template);
            }),
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
    updateTemplate(updateData: { templateName: string; content: string }): Observable<any> {
        return this.http.put(`${this.apiUrl}/update`, updateData);
    }

    // Also add this method to check template path
    getTemplatePath(templateName: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/template-path/${templateName}`);
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
        return preview;
    }

    // Get current template (for immediate access)
    getCurrentTemplate(): EmailTemplate | null {
        return this.currentTemplateSubject.value;
    }
}