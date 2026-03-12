import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemainingAmountCard } from './remaining-amount-card';

describe('RemainingAmountCard', () => {
  let component: RemainingAmountCard;
  let fixture: ComponentFixture<RemainingAmountCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemainingAmountCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemainingAmountCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
