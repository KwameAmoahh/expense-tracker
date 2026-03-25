import { Component, Inject, OnInit  } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { SignUpDialog } from '../sign-up-dialog/sign-up-dialog';
import { LoginDialogData } from '../../../models/User.model';
import { AuthService } from '../../../services/auth.service';



@Component({
  selector: 'app-login-dialog',
  imports: [ReactiveFormsModule,
            MatButtonModule,
            MatInputModule,
            MatFormFieldModule,
            MatDialogModule],
  templateUrl: './login-dialog.html',
  styleUrl: './login-dialog.css',
})
export class LoginDialog implements OnInit {
  protected loginForm!: FormGroup;
  protected errorMessage: string = '';
  protected successMessage: string = '';

  constructor(private fb: FormBuilder,
              private dialog: MatDialog,
              private dialogRef: MatDialogRef<LoginDialog>,
              @Inject(MAT_DIALOG_DATA) public data: LoginDialogData,
              private auth: AuthService
  ) {}  

  ngOnInit(): void {
    this.buildLoginForm({ emailAddress: '', password: '' });
  }

  private buildLoginForm(loginDialogData: LoginDialogData): void {
    this.loginForm = this.fb.group({
      emailAddress: [loginDialogData.emailAddress ?? '', [Validators.required, Validators.email]],
      password: [loginDialogData.password ?? '', [Validators.required]]
    });
  }

  protected getControl(controlName: string) {
    return this.loginForm.get(controlName);
  }

  protected async login(): Promise<void> {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';

      const { data, error } = await this.auth.signIn(
        this.loginForm.value.emailAddress,
        this.loginForm.value.password
      );

      if (error) {
        this.errorMessage = 'Invalid email or password';
        return;
      }

      this.successMessage = 'Login successful! Redirecting...';
      setTimeout(() => {
        this.dialogRef.close();
      }, 2000);
    }
  }
  
  protected openSignUp(): void {
    this.dialogRef.close();  // Close login dialog
    this.dialog.open(SignUpDialog);  // Open register dialog
  }

}
