// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { DashboardComponent } from './dashboard/dashboard.component';

// const routes: Routes = [
//   {
//     path: '',
//     component: DashboardComponent
//   }
// ];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule]
// })
// export class BusinessRoutingModule {}





import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SellerLayoutComponent } from './business-layout/business-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StatsCardsComponent } from './stats-cards/stats-cards.component';
import { ProfileCompletionComponent } from './profile-completion/profile-completion.component';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { PublicProfileComponent } from './public-profile/public-profile.component';
import { SettingsComponent } from './settings/settings.component';
import { EditProfileComponent } from './settings/edit-profile/edit-profile.component';
import { LeadsComponent } from './leads/leads.component';
import { ResponsesComponent } from './responses/responses.component';
import { HelpComponent } from './help/help.component';
import { ReferEarnComponent } from './refer-earn/refer-earn.component';
import { SharableProfileComponent } from './sharable-profile/sharable-profile.component';
import { LedgerComponent } from './ledger/ledger.component';
import { UsersComponent } from './users/users.component';
import { BranchesComponent } from './branches/branches.component';
import { InvitationGeneratorComponent } from './invitation-generator/invitation-generator.component';

// For seller not call by url
import { AuthService } from '../auth/auth.service';

const routes: Routes = [

  // ✅ PUBLIC ROUTE (NO GUARD)
  {
    path: 'sharableProfile/:id',
    component: SharableProfileComponent
  },



  {
    path: '',
    component: SellerLayoutComponent,
    canActivate: [AuthService],    // For seller not call by url
    children: [

      // /seller
      { path: '', component: DashboardComponent },

      // Leads
      { path: 'leads', component: LeadsComponent },

      { path: 'users', component: UsersComponent },

      { path: 'branches', component: BranchesComponent },

      // Responses
      { path: 'responses/:sellerId', component: ResponsesComponent },

      // Help
      { path: 'help', component: HelpComponent },

      // Stats / cards
      { path: 'cards', component: StatsCardsComponent },
      // Wallet  👈 ADD THIS
      { path: 'ledger', component: LedgerComponent },
      // Quick actions
      { path: 'quickAction', component: QuickActionsComponent },

      // Profile
      { path: 'completeProfile/:id', component: PublicProfileComponent },

      { path: 'refer/:sellerId', component: ReferEarnComponent },

      {path: 'invitation-generator' ,component: InvitationGeneratorComponent },

      // Settings (nested)
      {
        path: 'settings',
        component: SettingsComponent,
        children: [
          { path: 'profile/:id', component: EditProfileComponent }
        ]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellerRoutingModule { }

