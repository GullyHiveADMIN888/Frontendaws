import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoryMasterComponent } from './category-master/category-master.component';
// import { JobStatusMasterComponent } from './job-status-master/job-status-master.component';
// import { ProviderStatusMasterComponent } from './provider-status-master/provider-status-master.component';
// import { RoleMasterComponent } from './role-master/role-master.component';
// import { UserRolesComponent } from './user-roles/user-roles.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { SubCategoryMasterComponent } from './sub-category-master/sub-category-master.component';
import { QuestionMasterComponent } from './question-master/question-master.component';
import { CityMasterComponent } from './city-master/city-master.component';
import { LeadStatusMasterComponent } from './lead-status-master/lead-status-master.component';
import { ServicePackageMasterComponent } from './service-package-master/service-package-master.component';
import { AuditLogComponent } from './audit-log/audit-log.component';
import { AreaMasterComponent } from './area-master/area-master.component';
import { SubscriptionMasterComponent } from './subscription-master/subscription-master.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

const routes: Routes = [
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
    path: 'category-master',
    component: CategoryMasterComponent
  },
  {
    path: 'city-master',
    component: CityMasterComponent
  },
  // {
  //   path: 'job-status-master',
  //   component: JobStatusMasterComponent
  // },
  {
    path: 'lead-status-master',
    component: LeadStatusMasterComponent
  },
  // {
  //   path: 'provider-status-master',
  //   component: ProviderStatusMasterComponent
  // },
  {
    path: 'question-master',
    component: QuestionMasterComponent
  },
  // {
  //   path: 'role-master',
  //   component: RoleMasterComponent
  // },
  {
    path: 'sub-category-master',
    component: SubCategoryMasterComponent
  },
  // {
  //   path: 'user-roles',
  //   component: UserRolesComponent
  // },
  {
    path: 'user-management',
    component: UserManagementComponent
  },
  {
    path: 'service-package',
    component: ServicePackageMasterComponent
  },
  {
    path: 'audit-log',
    component: AuditLogComponent
  },
  {
    path: 'area-master',
    component: AreaMasterComponent
  },
  {
    path: 'subscription-master',
    component: SubscriptionMasterComponent
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent
  },
  { 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }