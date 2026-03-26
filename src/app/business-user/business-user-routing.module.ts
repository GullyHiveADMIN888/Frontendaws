import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BusinessUserLayoutComponent } from './business-user-layout/business-user-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';

// For seller not call by url
import { AuthService } from '../auth/auth.service';
import { WorkerManagementComponent } from './worker-management/worker-management.component';
import { OpsManagerProfileComponent } from './ops-manager-profile/ops-manager-profile.component';
import { OpsManagerJobComponent } from './ops-manager-job/ops-manager-job.component';
import { OpsManagerJobAssignComponent } from './ops-manager-job-assign/ops-manager-job-assign.component';



const routes: Routes = [

  // // ✅ PUBLIC ROUTE (NO GUARD)
  // {
  //   path: 'sharableProfile/:id',
  //   component: SharableProfileComponent
  // },



  {
    path: '',
    component: BusinessUserLayoutComponent,
    canActivate: [AuthService],
    children: [

      // /provider_User_Ops_Manager
      { path: '', component: OpsManagerJobComponent },


      { path: 'worker-management', component: WorkerManagementComponent },
      { path: 'profile', component: OpsManagerProfileComponent },
      { path: 'jobs', component: OpsManagerJobComponent },
      {
        path: 'jobs/assign/:id',
        component: OpsManagerJobAssignComponent
      }

      //  { path: 'users', component: UsersComponent },

      // // Responses
      // { path: 'responses/:sellerId', component: ResponsesComponent },

      // // Help
      // { path: 'help', component: HelpComponent },

      // // Stats / cards
      // { path: 'cards', component: StatsCardsComponent },
      // // Wallet  👈 ADD THIS
      // { path: 'ledger', component: LedgerComponent },
      // // Quick actions
      // { path: 'quickAction', component: QuickActionsComponent },

      // // Profile
      // { path: 'completeProfile/:id', component: PublicProfileComponent },

      // { path: 'refer/:sellerId', component: ReferEarnComponent }, 

      // // Settings (nested)
      // {
      //   path: 'settings',
      //   component: SettingsComponent,
      //   children: [
      //     { path: 'profile/:id', component: EditProfileComponent }
      //   ]
      // },
    ]
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessUserRoutingModule { }





