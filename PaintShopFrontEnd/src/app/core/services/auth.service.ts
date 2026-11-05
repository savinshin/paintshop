import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';

interface AuthState {
  email: string | null;
  isAdmin: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly email = signal<string | null>(null);
  readonly isAdmin = signal(false);
  readonly sessionError = signal<string | null>(null);

  private readonly readyPromise = this.reloadSession();

  whenReady(): Promise<void> {
    return this.readyPromise;
  }

  clearSession(): void {
    this.email.set(null);
    this.isAdmin.set(false);
  }

  async reloadSession(): Promise<void> {
    try {
      const state = await firstValueFrom(this.http.get<AuthState>('/api/auth/me').pipe(timeout(10000)));
      await this.refreshCsrf();
      this.email.set(state.email);
      this.isAdmin.set(state.isAdmin);
      this.sessionError.set(null);
    } catch {
      this.clearSession();
      this.sessionError.set('Не удалось проверить авторизацию. Проверьте соединение.');
    }
  }

  async login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.whenReady();
      await this.refreshCsrf();
      await firstValueFrom(this.http.post<void>('/api/auth/login', { email, password }).pipe(timeout(10000)));
      await this.reloadSession();
      if (!this.isAdmin())
        return { ok: false, error: this.sessionError()
          ? 'Вход выполнен, но проверить сессию не удалось. Обновите страницу.'
          : 'Не удалось проверить права администратора.' };
      return { ok: true };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401)
        return { ok: false, error: 'Неверный email или пароль.' };
      if (error instanceof HttpErrorResponse && error.status === 429)
        return { ok: false, error: 'Слишком много попыток. Попробуйте позже.' };
      return { ok: false, error: 'Не удалось войти. Проверьте соединение и попробуйте ещё раз.' };
    }
  }

  async logout(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.whenReady();
      await this.refreshCsrf();
      await firstValueFrom(this.http.post<void>('/api/auth/logout', {}).pipe(timeout(10000)));
      this.clearSession();
      try {
        await this.refreshCsrf();
        this.sessionError.set(null);
      } catch {
        this.sessionError.set('Вы вышли, но обновить защиту запроса не удалось. Обновите страницу.');
      }
      return { ok: true };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.clearSession();
        await this.reloadSession();
        return { ok: true };
      }
      return { ok: false, error: 'Не удалось завершить сеанс. Проверьте соединение и попробуйте ещё раз.' };
    }
  }

  private async refreshCsrf(): Promise<void> {
    await firstValueFrom(this.http.get<void>('/api/auth/csrf').pipe(timeout(10000)));
  }
}
