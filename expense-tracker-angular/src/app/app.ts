import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/common/navbar/navbar';
import { TotalSpentCard } from './components/dashboard/total-spent-card/total-spent-card';
import { RemainingAmountCard } from './components/dashboard/remaining-amount-card/remaining-amount-card';
import { TransactionCountCard } from './components/dashboard/transaction-count-card/transaction-count-card';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
            Navbar,
            TotalSpentCard,
            RemainingAmountCard,
            TransactionCountCard
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'expense-tracker-angular';
  tab: string = 'Dashboard';

  onSwitchedTab(tab: string) {
    this.tab = tab;
  }
}
