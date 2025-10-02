import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserData } from '../models/auth.types';
import { SecureStorageService } from './secure-storage.service';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {
  private userDataSubject = new BehaviorSubject<UserData | null>(null);
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  private sessionTimestampSubject = new BehaviorSubject<number | null>(null);
  
  public userData$ = this.userDataSubject.asObservable();
  public isAdmin$ = this.isAdminSubject.asObservable();
  public sessionTimestamp$ = this.sessionTimestampSubject.asObservable();

  constructor(private secureStorage: SecureStorageService) {
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    try {
      const storedUserData = this.secureStorage.getItem<UserData>(AUTH_CONSTANTS.STORAGE_KEYS.USER_DATA);
      const storedTimestamp = this.secureStorage.getItem<number>(AUTH_CONSTANTS.STORAGE_KEYS.SESSION_TIMESTAMP);

      if (storedUserData && storedTimestamp) {
        // Check if session is still valid
        const now = Date.now();
        const sessionAge = now - storedTimestamp;
        
        if (sessionAge < AUTH_CONSTANTS.SESSION.MAX_IDLE_TIME) {
          this.setUserDataInternal(storedUserData, storedTimestamp);
        } else {
          // Session expired, clear storage
          this.clearUserData();
        }
      }
    } catch (error) {
      console.warn('Failed to initialize user data from storage:', error);
      this.clearUserData();
    }
  }

  private setUserDataInternal(userData: UserData, timestamp?: number): void {
    const sessionTimestamp = timestamp || Date.now();
    
    this.userDataSubject.next(userData);
    this.isAdminSubject.next(userData.is_admin === true);
    this.sessionTimestampSubject.next(sessionTimestamp);
  }

  setUserData(userData: UserData): void {
    const timestamp = Date.now();
    
    try {
      // Store in secure storage
      this.secureStorage.setItem(AUTH_CONSTANTS.STORAGE_KEYS.USER_DATA, userData);
      this.secureStorage.setItem(AUTH_CONSTANTS.STORAGE_KEYS.SESSION_TIMESTAMP, timestamp);
      
      // Update subjects
      this.setUserDataInternal(userData, timestamp);
    } catch (error) {
      console.warn('Failed to store user data:', error);
      // Still update subjects even if storage fails
      this.setUserDataInternal(userData, timestamp);
    }
  }

  getUserData(): UserData | null {
    return this.userDataSubject.value;
  }

  isAdmin(): Observable<boolean> {
    return this.isAdmin$;
  }

  clearUserData(): void {
    try {
      this.secureStorage.clear();
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
    
    this.userDataSubject.next(null);
    this.isAdminSubject.next(false);
    this.sessionTimestampSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.userDataSubject.value !== null;
  }

  getSessionAge(): number | null {
    const timestamp = this.sessionTimestampSubject.value;
    if (!timestamp) {
      return null;
    }
    return Date.now() - timestamp;
  }

  isSessionExpired(): boolean {
    const sessionAge = this.getSessionAge();
    if (sessionAge === null) {
      return true;
    }
    return sessionAge > AUTH_CONSTANTS.SESSION.MAX_IDLE_TIME;
  }

  updateSessionTimestamp(): void {
    const userData = this.getUserData();
    if (userData) {
      const timestamp = Date.now();
      try {
        this.secureStorage.setItem(AUTH_CONSTANTS.STORAGE_KEYS.SESSION_TIMESTAMP, timestamp);
        this.sessionTimestampSubject.next(timestamp);
      } catch (error) {
        console.warn('Failed to update session timestamp:', error);
      }
    }
  }
}
