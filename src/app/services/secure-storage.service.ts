import { Injectable } from '@angular/core';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private readonly isStorageAvailable: boolean;

  constructor() {
    this.isStorageAvailable = this.checkStorageAvailability();
  }

  private checkStorageAvailability(): boolean {
    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private encrypt(data: string): string {
    // Simple base64 encoding for basic obfuscation
    // In production, consider using a proper encryption library
    try {
      return btoa(encodeURIComponent(data));
    } catch {
      return data;
    }
  }

  private decrypt(data: string): string {
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return data;
    }
  }

  setItem(key: string, value: any): void {
    if (!this.isStorageAvailable) {
      return;
    }

    try {
      const serializedValue = JSON.stringify(value);
      const encryptedValue = this.encrypt(serializedValue);
      sessionStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.warn('Failed to store data in session storage:', error);
    }
  }

  getItem<T>(key: string): T | null {
    if (!this.isStorageAvailable) {
      return null;
    }

    try {
      const encryptedValue = sessionStorage.getItem(key);
      if (!encryptedValue) {
        return null;
      }

      const decryptedValue = this.decrypt(encryptedValue);
      return JSON.parse(decryptedValue) as T;
    } catch (error) {
      console.warn('Failed to retrieve data from session storage:', error);
      this.removeItem(key); // Clean up corrupted data
      return null;
    }
  }

  removeItem(key: string): void {
    if (!this.isStorageAvailable) {
      return;
    }

    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove data from session storage:', error);
    }
  }

  clear(): void {
    if (!this.isStorageAvailable) {
      return;
    }

    try {
      // Only clear auth-related items
      Object.values(AUTH_CONSTANTS.STORAGE_KEYS).forEach(key => {
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear session storage:', error);
    }
  }

  isAvailable(): boolean {
    return this.isStorageAvailable;
  }
}
