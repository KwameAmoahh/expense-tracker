import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/common/navbar/navbar';
import { TotalSpentCard } from './components/dashboard/total-spent-card/total-spent-card';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
            Navbar,
            TotalSpentCard
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
