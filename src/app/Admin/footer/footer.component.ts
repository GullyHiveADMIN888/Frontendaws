// admin/footer/footer.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


@Component({
    selector: 'app-admin-footer',
    templateUrl: './footer.component.html',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,          
        ReactiveFormsModule,   
        RouterModule
    ]
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
}