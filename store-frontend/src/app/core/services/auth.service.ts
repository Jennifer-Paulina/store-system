import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, AuthResponse, RefreshTokenRequest } from '../../models/auth.model';
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'store-system-2024';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.authApiUrl;
  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request);
  }
  register(request: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request);
  }
  refreshToken(request: RefreshTokenRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh-token`, request);
  }
  me(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/me`);
  }

  saveTokens(response: AuthResponse): void {
    localStorage.setItem('accessToken', CryptoJS.AES.encrypt(response.accessToken, SECRET_KEY).toString());
    localStorage.setItem('refreshToken', CryptoJS.AES.encrypt(response.refreshToken, SECRET_KEY).toString());
    localStorage.setItem('user', CryptoJS.AES.encrypt(JSON.stringify({
      id: response.id,
      name: response.name,
      email: response.email,
      role: response.role
    }), SECRET_KEY).toString());
  }

  getAccessToken(): string | null {
    const encrypted = localStorage.getItem('accessToken');
    if (!encrypted) return null;
    return CryptoJS.AES.decrypt(encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8);
  }

  getRefreshToken(): string | null {
    const encrypted = localStorage.getItem('refreshToken');
    if (!encrypted) return null;
    return CryptoJS.AES.decrypt(encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8);
  }

  getUser(): any {
    const encrypted = localStorage.getItem('user');
    if (!encrypted) return null;
    const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8);
    return decrypted ? JSON.parse(decrypted) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}