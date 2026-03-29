import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-sign-up-dialog',
  imports: [ReactiveFormsModule,
            MatButtonModule,
            MatInputModule,
            MatFormFieldModule,
            MatDialogModule],
  templateUrl: './sign-up-dialog.html',
  styleUrls: ['./sign-up-dialog.css']
})
export class SignUpDialog {
  signUpForm: FormGroup;
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    protected dialogRef: MatDialogRef<SignUpDialog>
  ) {
    this.signUpForm = this.fb.group({
      emailAddress: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  get passwordMismatch(): boolean {
    return this.signUpForm.hasError('passwordMismatch') && 
           this.signUpForm.get('confirmPassword')?.touched === true;
  }

  protected async signUp(): Promise<void> {
    if (this.signUpForm.valid) {
      this.errorMessage = '';
      this.loading = true;

      const { emailAddress, password } = this.signUpForm.value;

      const { error } = await this.auth.signUp(emailAddress, password);

      if (error) {
        this.errorMessage = error.message;
        this.loading = false;
        return;
      }

      // Auto login after sign up
      const { error: loginError } = await this.auth.signIn(emailAddress, password);

      if (loginError) {
        this.errorMessage = 'Account created but login failed. Please log in manually.';
        this.loading = false;
        return;
      }

      this.dialogRef.close({ loggedIn: true });
    }
  }
}