// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';
// import { AdminRoutingModule } from './admin-routing.module';
// import { ReactiveFormsModule } from '@angular/forms';
// // Layout Components
// import { HeaderComponent } from './header/header.component';
// import { FooterComponent } from './footer/footer.component';

// // Dashboard Components
// import { DashboardComponent } from './dashboard/dashboard.component';

// // Master Components
// // import { CityMasterComponent } from './city-master/city-master.component';
// // import { JobStatusMasterComponent } from './job-status-master/job-status-master.component';
// // import { LeadStatusMasterComponent } from './lead-status-master/lead-status-master.component';
// // import { ProviderStatusMasterComponent } from './provider-status-master/provider-status-master.component';
// // import { QuestionMasterComponent } from './question-master/question-master.component';
// // import { RoleMasterComponent } from './role-master/role-master.component';
// // import { SubCategoryMasterComponent } from './sub-category-master/sub-category-master.component';
// // import { UserRolesComponent } from './user-roles/user-roles.component';
// import { CategoryMasterComponent } from './category-master/category-master.component';
// import { UserManagementComponent } from './user-management/user-management.component';
// import { SubCategoryMasterComponent } from './sub-category-master/sub-category-master.component';
// import { QuestionMasterComponent } from './question-master/question-master.component';
// import { CityMasterComponent } from './city-master/city-master.component';
// import { LeadStatusMasterComponent } from './lead-status-master/lead-status-master.component';
// import { ServicePackageMasterComponent } from './service-package-master/service-package-master.component';
// import { AuditLogComponent } from './audit-log/audit-log.component';
// import { AreaMasterComponent } from './area-master/area-master.component';
// import { ChangePasswordComponent } from './change-password/change-password.component';
// import { EmailTemplateComponent } from './email-template/email-template.component';
// import { LeadPricingConfigComponent } from './lead-pricing-config/lead-pricing-config.component';
// import { LeadPricingEngineComponent } from './lead-pricing-engine/lead-pricing-engine.component';
// import { SubscriptionMasterComponent} from './subscription-master/subscription-master.component';
// import { WalletTransactionComponent } from './wallet-transaction/wallet-transaction.component';
// import { LeadAssignmentComponent } from './lead-assignment/lead-assignment.component';
// import { LeadListComponent } from './lead/lead.component';
// import { WalletListComponent } from './wallet/wallet.component';

// @NgModule({
//   declarations: [
//     // Layout Components
//     HeaderComponent,
//     FooterComponent,
    
//     //Dashboard Components
//     DashboardComponent,
    
//     //Master Components
//     CategoryMasterComponent,
//     UserManagementComponent,
//     CityMasterComponent,
//     // JobStatusMasterComponent,
//     LeadStatusMasterComponent,
//     // ProviderStatusMasterComponent,
//     QuestionMasterComponent,
//     // RoleMasterComponent,
//     SubCategoryMasterComponent,
//     // UserRolesComponent
//     ServicePackageMasterComponent,
//     AuditLogComponent,
//     AreaMasterComponent,
//     ChangePasswordComponent,
//     EmailTemplateComponent,
//     LeadPricingConfigComponent,
//     LeadPricingEngineComponent,
//     SubscriptionMasterComponent,
//     WalletTransactionComponent,
//     LeadAssignmentComponent,
//     LeadListComponent,
//     WalletListComponent
//   ],
//   imports: [
//     CommonModule,
//     AdminRoutingModule,
//     FormsModule,
//     HttpClientModule,
//     ReactiveFormsModule,
//     // DashboardComponent,
//   ],
//   exports: [
//     HeaderComponent,
//     FooterComponent
//   ]
// })
// export class AdminModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AdminRoutingModule } from './admin-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

// Import components (they are now standalone)
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoryMasterComponent } from './category-master/category-master.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { SubCategoryMasterComponent } from './sub-category-master/sub-category-master.component';
import { QuestionMasterComponent } from './question-master/question-master.component';
import { CityMasterComponent } from './city-master/city-master.component';
import { LeadStatusMasterComponent } from './lead-status-master/lead-status-master.component';
import { ServicePackageMasterComponent } from './service-package-master/service-package-master.component';
import { AuditLogComponent } from './audit-log/audit-log.component';
import { AreaMasterComponent } from './area-master/area-master.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { LeadPricingConfigComponent } from './lead-pricing-config/lead-pricing-config.component';
import { LeadPricingEngineComponent } from './lead-pricing-engine/lead-pricing-engine.component';
import { SubscriptionMasterComponent} from './subscription-master/subscription-master.component';
import { WalletTransactionComponent } from './wallet-transaction/wallet-transaction.component';
import { LeadAssignmentComponent } from './lead-assignment/lead-assignment.component';
import { LeadListComponent } from './lead/lead.component';
import { WalletListComponent } from './wallet/wallet.component';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    // Import standalone components here instead of declaring them
    HeaderComponent,
    FooterComponent,
    DashboardComponent,
    CategoryMasterComponent,
    UserManagementComponent,
    CityMasterComponent,
    LeadStatusMasterComponent,
    QuestionMasterComponent,
    SubCategoryMasterComponent,
    ServicePackageMasterComponent,
    AuditLogComponent,
    AreaMasterComponent,
    ChangePasswordComponent,
    EmailTemplateComponent,
    LeadPricingConfigComponent,
    LeadPricingEngineComponent,
    SubscriptionMasterComponent,
    WalletTransactionComponent,
    LeadAssignmentComponent,
    LeadListComponent,
    WalletListComponent
  ],
  // Remove declarations array completely
  exports: [
    HeaderComponent,
    FooterComponent
  ]
})
export class AdminModule { }