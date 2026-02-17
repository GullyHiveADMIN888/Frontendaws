

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SellerLayoutComponent } from './seller-layout/seller-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StatsCardsComponent } from './stats-cards/stats-cards.component';
import { ProfileCompletionComponent } from './profile-completion/profile-completion.component';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { RecentLeadsComponent } from './recent-leads/recent-leads.component';
import { PublicProfileComponent } from './public-profile/public-profile.component';
import { SettingsComponent } from './settings/settings.component';
import { EditProfileComponent } from './settings/edit-profile/edit-profile.component';
import { LeadsComponent } from './leads/leads.component';
import { ResponsesComponent } from './responses/responses.component';
import { HelpComponent } from './help/help.component';
import { ReferEarnComponent } from './refer-earn/refer-earn.component';
import {  SharableProfileComponent} from './sharable-profile/sharable-profile.component';
import { LedgerComponent } from './ledger/ledger.component';

// For seller not call by url
import { AuthService } from '../auth/auth.service'; 

const routes: Routes = [
  {
    path: '',
    component: SellerLayoutComponent,
    canActivate: [AuthService],    // For seller not call by url
    children: [

      // /seller
      { path: '', component: DashboardComponent },

      // Leads
      { path: 'leads', component: LeadsComponent },
      { path: 'leads/:id', component: RecentLeadsComponent },
      { path: 'recentLeads', component: RecentLeadsComponent },

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
       { path: 'sharableProfile/:id', component: SharableProfileComponent },

      { path: 'refer/:sellerId', component: ReferEarnComponent }, // 👈 ADD THIS

      // Settings (nested)
      {
        path: 'settings',
        component: SettingsComponent,
        children: [
          { path: 'profile/:id', component: EditProfileComponent }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellerRoutingModule {}
