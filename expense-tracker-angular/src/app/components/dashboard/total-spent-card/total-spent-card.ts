import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-total-spent-card',
  imports: [CurrencyPipe],
  templateUrl: './total-spent-card.html',
  styleUrl: './total-spent-card.css',
})
export class TotalSpentCard {
  @Input() totalSpent: number = 11743;
  @Input() budget: number = 19000;
}
