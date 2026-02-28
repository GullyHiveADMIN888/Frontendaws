import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  pendingQuotesCount = 0;
  
  // Track loaded children
  private loadedChildren: Set<string> = new Set<string>();
  private totalChildren = 1; // Only quotes component for now

  ngOnInit(): void {
    // Set a timeout to hide loader even if child events don't fire (fallback)
    setTimeout(() => {
      if (this.isLoading) {
        console.warn('Force hiding loader after timeout');
        this.isLoading = false;
      }
    }, 5000); // 5 second timeout
  }

  onChildDataLoaded(childName: string): void {
    console.log(`Child loaded: ${childName}`);
    this.loadedChildren.add(childName);
    
    // Check if all children have loaded
    if (this.loadedChildren.size >= this.totalChildren) {
      this.hideLoader();
    }
  }

  updatePendingQuotesCount(count: number): void {
    this.pendingQuotesCount = count;
  }

  private hideLoader(): void {
    // Small delay to ensure smooth transition
    setTimeout(() => {
      this.isLoading = false;
    }, 300);
  }
}