// admin/footer/footer.component.ts
import { Component } from '@angular/core';


@Component({
    selector: 'app-admin-footer',
    templateUrl: './footer.component.html',
    standalone: false
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
}