// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-help',
//   templateUrl: './help.component.html',
//   styleUrls: ['./help.component.css']
// })
// export class HelpComponent {
//   showUserMenu = false;
//   searchQuery = '';
//   expandedFaq: number | null = null;

//   helpCategories = [
//     {
//       icon: 'ri-question-line',
//       title: 'Getting Started',
//       description: 'Learn the basics of using the platform',
//       articles: 12
//     },
//     {
//       icon: 'ri-user-settings-line',
//       title: 'Account Management',
//       description: 'Manage your profile and settings',
//       articles: 8
//     },
//     {
//       icon: 'ri-money-dollar-circle-line',
//       title: 'Payments & Billing',
//       description: 'Understanding payments and invoices',
//       articles: 10
//     },
//     {
//       icon: 'ri-customer-service-line',
//       title: 'Customer Support',
//       description: 'Get help from our support team',
//       articles: 6
//     }
//   ];

//   faqs = [
//     {
//       question: 'How do I respond to leads?',
//       answer: 'Go to Leads → select a lead → click Send Quote and submit your response.'
//     },
//     {
//       question: 'How much does it cost to use the platform?',
//       answer: 'We charge a small commission only after successful job completion.'
//     },
//     {
//       question: 'How do I get more leads?',
//       answer: 'Complete your profile, respond fast, and maintain a high response rate.'
//     },
//     {
//       question: 'What should I include in my quote?',
//       answer: 'Cost breakdown, timeline, inclusions, and terms.'
//     },
//     {
//       question: 'How do I handle disputes?',
//       answer: 'Try resolving directly; contact support if needed.'
//     },
//     {
//       question: 'Can I work in multiple locations?',
//       answer: 'Yes, configure multiple service areas in profile settings.'
//     }
//   ];

//   // toggleUserMenu() {
//   //   this.showUserMenu = !this.showUserMenu;
//   // }

//   toggleFaq(index: number) {
//     this.expandedFaq = this.expandedFaq === index ? null : index;
//   }

//   // logout() {
//   //   window.location.href = '/';
//   // }
// }




import { Component, OnInit } from '@angular/core';
import { SellerService, HelpFaq,HelpCategory } from '../seller.service';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.css'],
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

