

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { link } from 'fs';
@Component({
    selector: 'app-quick-actions',
    templateUrl: './quick-actions.component.html',
    standalone: false
})
export class QuickActionsComponent {
  @Output() editServices = new EventEmitter<void>();
  @Input() sellerId!: number;



  constructor(private router: Router) {}

  actions = [
    {
      title: 'View New Leads',
      icon: 'ri-mail-open-line',
      link: '/business/leads',
      color: 'bg-orange-50 text-orange-600'
    },
    {
      title: 'Edit Services',
      icon: 'ri-tools-line',
      action: 'editServices',
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'Add User',
      icon: 'ri-user-line',
      link: '/business/users',
      color: 'bg-indigo-50 text-indigo-600'
    },
     {
      title: 'Add Branch',
      icon: 'ri-building-line',
      link: '/business/branches',
      color: 'bg-indigo-50 text-indigo-600'
    }
  ];


onAction(action: any) {
  if (action.action === 'editServices') {
    this.editServices.emit();
  } 
  else if (action.link) {
    this.router.navigate([action.link]);
  }
}

}
