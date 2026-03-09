// admin/footer/footer.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-footer',
    templateUrl: './footer.component.html',
    standalone: false
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
}