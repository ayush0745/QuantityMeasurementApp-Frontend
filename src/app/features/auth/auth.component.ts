import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  activeTab: 'login' | 'signup' = 'login';

  loginEmail = '';
  loginPassword = '';
  loginError = '';
  loginLoading = false;
  loginShowPassword = false;

  signupName = '';
  signupEmail = '';
  signupPassword = '';
  signupError = '';
  signupLoading = false;
  signupShowPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  setTab(tab: 'login' | 'signup') {
    this.activeTab = tab;
    this.loginError = '';
    this.signupError = '';
  }

  async handleLogin() {
    this.loginError = '';
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Please fill all fields';
      return;
    }
    this.loginLoading = true;
    this.auth.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loginError = err.error?.message || err.error?.error || 'Login failed';
        this.loginLoading = false;
      }
    });
  }

  async handleSignup() {
    this.signupError = '';
    if (!this.signupName || !this.signupEmail || !this.signupPassword) {
      this.signupError = 'Please fill all fields';
      return;
    }
    this.signupLoading = true;
    this.auth.register(this.signupName, this.signupEmail, this.signupPassword).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.signupError = err.error?.message || err.error?.error || 'Registration failed';
        this.signupLoading = false;
      }
    });
  }
}
