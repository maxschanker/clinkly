import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for encoding/decoding treat data in URLs
export function encodeTreatData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    return btoa(jsonString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    console.error('Error encoding treat data:', error);
    return '';
  }
}

export function decodeTreatData(encoded: string): any | null {
  try {
    // Add padding back if needed
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonString = atob(base64);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decoding treat data:', error);
    return null;
  }
}
