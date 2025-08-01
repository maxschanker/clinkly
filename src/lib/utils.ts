import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for encoding/decoding treat data in URLs
export function encodeTreatData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    const encoded = btoa(jsonString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    console.log('Encoded treat data:', { data, encoded });
    return encoded;
  } catch (error) {
    console.error('Error encoding treat data:', error, data);
    return '';
  }
}

export function decodeTreatData(encoded: string): any | null {
  try {
    console.log('Attempting to decode:', encoded);
    // Add padding back if needed
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonString = atob(base64);
    const decoded = JSON.parse(jsonString);
    console.log('Successfully decoded treat data:', decoded);
    return decoded;
  } catch (error) {
    console.error('Error decoding treat data:', error, { encoded });
    return null;
  }
}
