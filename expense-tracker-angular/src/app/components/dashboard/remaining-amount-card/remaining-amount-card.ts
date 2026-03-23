import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-remaining-amount-card',
  imports: [CurrencyPipe],
  templateUrl: './remaining-amount-card.html',
  styleUrl: './remaining-amount-card.css',
})
export class RemainingAmountCard {
  @Input() remainingAmount: number = 5251.50;
}
