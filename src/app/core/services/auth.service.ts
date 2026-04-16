import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';

  constructor(private http: HttpClient, private router: Router) {}

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiBase}/api/auth/login`, { email, password }).pipe(
      tap(res => localStorage.setItem(this.TOKEN_KEY, res.accessToken))
    );
  }

  register(name: string, email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiBase}/api/auth/register`, { name, email, password }).pipe(
      tap(res => localStorage.setItem(this.TOKEN_KEY, res.accessToken))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/auth']);
  }
}
