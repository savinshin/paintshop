import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase: SupabaseClient;

  readonly session = signal<Session | null>(null);
  readonly isAdmin = signal<boolean>(false);

  private readonly readyPromise: Promise<void>;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);

    this.readyPromise = this.restoreSession().catch(() => {
      this.session.set(null);
      this.isAdmin.set(false);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.isAdmin.set(this.extractIsAdmin(session));
    });
  }

  whenReady(): Promise<void> {
    return this.readyPromise;
  }

  private async restoreSession(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    const session = data.session ?? null;

    this.session.set(session);
    this.isAdmin.set(this.extractIsAdmin(session));
  }

  async login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error) return { ok: false, error: error.message };

    const session = data.session ?? null;
    this.session.set(session);
    this.isAdmin.set(this.extractIsAdmin(session));

    return { ok: true };
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.session.set(null);
    this.isAdmin.set(false);
  }

  getAccessToken(): string | null {
    return this.session()?.access_token ?? null;
  }

  private extractIsAdmin(session: Session | null): boolean {
    if (!session) return false;
    const appMeta = session.user.app_metadata as Record<string, unknown> | undefined;
    return appMeta?.['role'] === 'admin';
  }
}
