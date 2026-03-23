import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-transaction-count-card',
  imports: [CurrencyPipe],
  templateUrl: './transaction-count-card.html',
  styleUrl: './transaction-count-card.css',
})
export class TransactionCountCard {
  @Input() transactionCount: number = 34;
}
