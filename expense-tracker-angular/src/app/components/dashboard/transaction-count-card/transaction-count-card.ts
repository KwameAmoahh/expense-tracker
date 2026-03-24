import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-transaction-count-card',
  imports: [],
  templateUrl: './transaction-count-card.html',
  styleUrl: './transaction-count-card.css',
})
export class TransactionCountCard {
  @Input() transactionCount: number = 34;
}
