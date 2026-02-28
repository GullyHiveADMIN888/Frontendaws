import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerLayoutComponent } from './customer-layout/customer-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomerLeadsComponent } from './customer-leads/customer-leads.component';
import { CustomerQuotesComponent } from './customer-quotes/customer-quotes.component';

const routes: Routes = [
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      { 
        path: '', 
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent 
      },
      { 
        path: 'leads', 
        component: CustomerLeadsComponent
      },
      { 
        path: 'quotes', 
        component: CustomerQuotesComponent 
      },
      { 
        path: 'saved-sellers', 
        component: DashboardComponent 
      },
      { 
        path: 'settings', 
        component: DashboardComponent 
      },
      { 
        path: 'help', 
        component: DashboardComponent
      },
      { 
        path: 'profile/:id', 
        component: DashboardComponent 
      },
      { 
        path: 'referrals', 
        component: DashboardComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }