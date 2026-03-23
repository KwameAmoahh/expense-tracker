import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalSpentCard } from './total-spent-card';

describe('TotalSpentCard', () => {
  let component: TotalSpentCard;
  let fixture: ComponentFixture<TotalSpentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalSpentCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalSpentCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
