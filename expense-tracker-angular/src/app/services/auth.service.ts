import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  constructor(private supabase: SupabaseService) {}

  signUp(email: string, password: string) {
    return this.supabase.client.auth.signUp({ email, password });
  }

  signIn(email: string, password: string) {
    return this.supabase.client.auth.signInWithPassword({ email, password });
  }

  signOut() {
    return this.supabase.client.auth.signOut();
  }

  getSession() {
    return this.supabase.client.auth.getSession();
  }

  getUser() {
    return this.supabase.client.auth.getUser();
  }
}
