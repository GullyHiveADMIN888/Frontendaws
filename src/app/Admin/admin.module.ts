import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AdminRoutingModule } from './admin-routing.module';

// Layout Components
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

// Dashboard Components
import { DashboardComponent } from './dashboard/dashboard.component';

// Master Components
// import { CityMasterComponent } from './city-master/city-master.component';
// import { JobStatusMasterComponent } from './job-status-master/job-status-master.component';
// import { LeadStatusMasterComponent } from './lead-status-master/lead-status-master.component';
// import { ProviderStatusMasterComponent } from './provider-status-master/provider-status-master.component';
// import { QuestionMasterComponent } from './question-master/question-master.component';
// import { RoleMasterComponent } from './role-master/role-master.component';
// import { SubCategoryMasterComponent } from './sub-category-master/sub-category-master.component';
// import { UserRolesComponent } from './user-roles/user-roles.component';
import { CategoryMasterComponent } from './category-master/category-master.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { SubCategoryMasterComponent } from './sub-category-master/sub-category-master.component';
import { QuestionMasterComponent } from './question-master/question-master.component';
import { CityMasterComponent } from './city-master/city-master.component';
import { LeadStatusMasterComponent } from './lead-status-master/lead-status-master.component';
import { ServicePackageMasterComponent } from './service-package-master/service-package-master.component';

@NgModule({
  declarations: [
    // Layout Components
    HeaderComponent,
    FooterComponent,
    
    //Dashboard Components
    DashboardComponent,
    
    //Master Components
    CategoryMasterComponent,
    UserManagementComponent,
    CityMasterComponent,
    // JobStatusMasterComponent,
    LeadStatusMasterComponent,
    // ProviderStatusMasterComponent,
    QuestionMasterComponent,
    // RoleMasterComponent,
    SubCategoryMasterComponent,
    // UserRolesComponent
    ServicePackageMasterComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent
  ]
})
export class AdminModule { }