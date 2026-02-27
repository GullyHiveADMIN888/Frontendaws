

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.component.html'
})
export class QuickActionsComponent {
  @Output() editServices = new EventEmitter<void>();
  @Input() sellerId!: number;



  constructor(private router: Router) {}

  actions = [
    {
      title: 'View New Leads',
      icon: 'ri-mail-open-line',
      link: '/seller/leads',
      color: 'bg-orange-50 text-orange-600'
    },
    {
      title: 'Edit Services',
      icon: 'ri-tools-line',
      action: 'editServices',
      color: 'bg-indigo-50 text-indigo-600'
    }
  ];


// onAction(action: any) {
//   if (action.action === 'editServices') {
//     this.editServices.emit();
//   } else if (action.link) {
//     // optional: handle navigation here
//   }
// }
onAction(action: any) {
  if (action.action === 'editServices') {
    this.editServices.emit();
  } 
  else if (action.link) {
    this.router.navigate([action.link]);
  }
}

}
