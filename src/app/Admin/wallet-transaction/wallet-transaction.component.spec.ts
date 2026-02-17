import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletTransactionComponent } from './wallet-transaction.component';

describe('WalletTransactionComponent', () => {
  let component: WalletTransactionComponent;
  let fixture: ComponentFixture<WalletTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletTransactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
