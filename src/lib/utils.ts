import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for encoding/decoding treat data in URLs
export function encodeTreatData(data: any): string {
  try {
    // Ensure we have valid data before encoding
    if (!data || typeof data !== 'object') {
      console.error('Invalid data for encoding:', data);
      return '';
    }
    
    const jsonString = JSON.stringify(data);
    console.log('JSON string to encode:', jsonString);
    
    const encoded = btoa(jsonString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    console.log('Successfully encoded treat data:', { data, jsonLength: jsonString.length, encoded: encoded.substring(0, 50) + '...' });
    return encoded;
  } catch (error) {
    console.error('Error encoding treat data:', error, data);
    return '';
  }
}

export function decodeTreatData(encoded: string): any | null {
  try {
    if (!encoded || typeof encoded !== 'string') {
      console.error('Invalid encoded string:', encoded);
      return null;
    }
    
    console.log('Attempting to decode:', { encoded: encoded.substring(0, 50) + '...', length: encoded.length });
    
    // Add padding back if needed
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    console.log('Base64 after padding:', { base64: base64.substring(0, 50) + '...', length: base64.length });
    
    const jsonString = atob(base64);
    console.log('Decoded JSON string:', { jsonString: jsonString.substring(0, 100) + '...', length: jsonString.length });
    
    const decoded = JSON.parse(jsonString);
    console.log('Successfully decoded treat data:', { 
      hasSlug: !!decoded.slug, 
      hasSenderName: !!decoded.senderName, 
      hasMessage: !!decoded.message,
      keys: Object.keys(decoded)
    });
    
    return decoded;
  } catch (error) {
    console.error('Error decoding treat data:', error, { encoded: encoded.substring(0, 50) + '...', encodedLength: encoded.length });
    return null;
  }
}
