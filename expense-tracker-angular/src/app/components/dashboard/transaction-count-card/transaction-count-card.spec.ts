import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionCountCard } from './transaction-count-card';

describe('TransactionCountCard', () => {
  let component: TransactionCountCard;
  let fixture: ComponentFixture<TransactionCountCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionCountCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionCountCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
