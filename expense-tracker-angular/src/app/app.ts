import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Navbar } from './components/common/navbar/navbar';
import { TotalSpentCard } from './components/dashboard/total-spent-card/total-spent-card';
import { RemainingAmountCard } from './components/dashboard/remaining-amount-card/remaining-amount-card';
import { TransactionCountCard } from './components/dashboard/transaction-count-card/transaction-count-card';
import { LoginDialog } from './components/auth/login-dialog/login-dialog';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
            CommonModule,
            Navbar,
            TotalSpentCard,
            RemainingAmountCard,
            TransactionCountCard,
            LoginDialog
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'expense-tracker-angular';
  isLoggedIn = false;
  tab: string = 'Dashboard';

  constructor(private dialog: MatDialog,
              private auth: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const { data } = await this.auth.getSession();

    if (!data.session) {
      const dialogRef = this.dialog.open(LoginDialog, {
        disableClose: true,
        data: { emailAddress: '', password: '' }
      });

      dialogRef.afterClosed().subscribe(async () => {
        const { data } = await this.auth.getSession();
        if (data.session) {
          this.isLoggedIn = true;
        }
      });
    } else {
      this.isLoggedIn = true;
    }
  }

  onSwitchedTab(tab: string) {
    this.tab = tab;
  }

}
