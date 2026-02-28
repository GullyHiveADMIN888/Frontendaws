import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { CustomerRoutingModule } from './customer-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomerLeadsComponent } from './customer-leads/customer-leads.component';
import { CustomerQuotesComponent } from './customer-quotes/customer-quotes.component';


@NgModule({
  declarations: [
    DashboardComponent,
    CustomerLeadsComponent,
    CustomerQuotesComponent
  ],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule 
  ]
})
export class CustomerModule { }