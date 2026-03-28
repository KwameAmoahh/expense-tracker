import { Component } from '@angular/core';
import { TotalSpentCard } from '../total-spent-card/total-spent-card';
import { RemainingAmountCard } from '../remaining-amount-card/remaining-amount-card';
import { TransactionCountCard } from '../transaction-count-card/transaction-count-card';

@Component({
  selector: 'app-dashboard-page',
  imports: [
            TotalSpentCard,
            RemainingAmountCard,
            TransactionCountCard
          ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {

}
