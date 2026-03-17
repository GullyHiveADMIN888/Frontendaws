import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



import { BusinessUserRoutingModule } from './business-user-routing.module';

import { DashboardComponent } from './dashboard/dashboard.component';
 // import { LayoutComponent } from './Business-user-layout/Business-user-layout.component';
// import { StatsCardsComponent } from './stats-cards/stats-cards.component';
// import { ProfileCompletionComponent } from './profile-completion/profile-completion.component';
// import { QuickActionsComponent } from './quick-actions/quick-actions.component';
// import { PublicProfileComponent } from './public-profile/public-profile.component';
// import { SettingsComponent } from './settings/settings.component';
// import { EditProfileComponent } from './settings/edit-profile/edit-profile.component';
import { RouterModule } from '@angular/router';
// import { LeadsComponent } from './leads/leads.component';
// import { ResponsesComponent } from './responses/responses.component';
// import { HelpComponent } from './help/help.component';
// import { ReferEarnComponent } from './refer-earn/refer-earn.component';
import { ReactiveFormsModule } from '@angular/forms'; //
import { FormsModule } from '@angular/forms';
// import { LedgerComponent } from './ledger/ledger.component';




@NgModule({
  declarations: [
     DashboardComponent,
    // StatsCardsComponent,
    // ProfileCompletionComponent,
    // QuickActionsComponent,
    // PublicProfileComponent,
    // SettingsComponent,
    // EditProfileComponent,
    // LeadsComponent,
    // ResponsesComponent,
    // HelpComponent,
    // ReferEarnComponent,
    // LedgerComponent
   
  ],
  imports: [
    CommonModule,
    BusinessUserRoutingModule,
     RouterModule, // needed for routerLink
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class BusinessUserModule { }





