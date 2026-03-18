
import { Component, OnInit } from '@angular/core';
import { SellerService, HelpFaq,HelpCategory } from '../business.service';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    standalone: false
})
export class HelpComponent implements OnInit {

  helpCategories: HelpCategory[] = [];
  faqs: HelpFaq[] = [];

 searchQuery = '';
   // 🔹 Keep original copy for search reset
  allFaqs: HelpFaq[] = [];

  expandedFaq: number | null = null;
  loading = false;

  constructor(private helpService: SellerService) {}

  ngOnInit(): void {
    this.loadHelpData();
  }

  loadHelpData() {
    this.loading = true;

    this.helpService.getHelpFaqs().subscribe({
      next: (res) => {
        this.helpCategories = res.categories;
        this.faqs = res.faqs;
        this.loading = false;
          this.allFaqs = res.faqs; // backup
      },
      error: (err) => {
        console.error('Failed to load help data', err);
        this.loading = false;
      }
    });
  }

  toggleFaq(index: number) {
    this.expandedFaq = this.expandedFaq === index ? null : index;
  }


    // 🔍 SEARCH LOGIC
  applySearch() {
    const q = this.searchQuery.trim().toLowerCase();

    if (!q) {
      this.faqs = this.allFaqs;
      return;
    }

    this.faqs = this.allFaqs.filter(faq =>
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q)
    );
  }
}

