import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserData {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {
  private userDataSubject = new BehaviorSubject<UserData | null>(null);
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  
  public userData$ = this.userDataSubject.asObservable();
  public isAdmin$ = this.isAdminSubject.asObservable();

  constructor() {
    // Initialize with null values
    this.userDataSubject.next(null);
    this.isAdminSubject.next(false);
  }

  setUserData(userData: UserData): void {
    this.userDataSubject.next(userData);
    this.isAdminSubject.next(userData.is_admin === true);
  }

  getUserData(): UserData | null {
    return this.userDataSubject.value;
  }

  isAdmin(): Observable<boolean> {
    return this.isAdmin$;
  }

  isAdminValue(): boolean {
    return this.isAdminSubject.value;
  }

  clearUserData(): void {
    this.userDataSubject.next(null);
    this.isAdminSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.userDataSubject.value !== null;
  }
}
