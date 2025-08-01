import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Constants for URL length management
const MAX_URL_LENGTH = 2000; // Conservative limit for browser compatibility
const MAX_ENCODED_DATA_LENGTH = 1500; // Leave room for base URL and parameters

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
    console.log('Encoded data length:', encoded.length);
    
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

// Generate a unique ID for stored treats
function generateTreatId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Create shareable URL with fallback to storage for large data
export function createShareableURL(data: any, baseURL: string): { url: string; success: boolean; usedFallback: boolean } {
  try {
    const encoded = encodeTreatData(data);
    if (!encoded) {
      console.error('Failed to encode treat data');
      return { url: '', success: false, usedFallback: false };
    }

    // Create the full URL to check length
    const fullURL = `${baseURL}/t/${data.slug}?data=${encoded}`;
    
    // Check if URL exceeds length limits
    if (fullURL.length > MAX_URL_LENGTH || encoded.length > MAX_ENCODED_DATA_LENGTH) {
      console.log('URL too long, using fallback storage:', {
        fullURLLength: fullURL.length,
        encodedLength: encoded.length,
        maxURL: MAX_URL_LENGTH,
        maxEncoded: MAX_ENCODED_DATA_LENGTH
      });
      
      // Use fallback: store data in localStorage with unique ID
      const treatId = generateTreatId();
      const storageKey = `treat_${treatId}`;
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
        console.log('Stored treat data in localStorage with key:', storageKey);
        
        // Create shorter URL with just the ID
        const fallbackURL = `${baseURL}/t/${data.slug}?id=${treatId}`;
        return { url: fallbackURL, success: true, usedFallback: true };
      } catch (storageError) {
        console.error('Failed to store treat data in localStorage:', storageError);
        return { url: '', success: false, usedFallback: false };
      }
    }

    // URL is within limits, use direct encoding
    console.log('URL within limits, using direct encoding');
    return { url: fullURL, success: true, usedFallback: false };

  } catch (error) {
    console.error('Error creating shareable URL:', error);
    return { url: '', success: false, usedFallback: false };
  }
}

// Retrieve treat data from URL or fallback storage
export function retrieveTreatData(urlParams: URLSearchParams): any | null {
  try {
    // First try to get data from direct encoding
    const encodedData = urlParams.get('data');
    if (encodedData) {
      console.log('Found encoded data in URL, attempting to decode');
      const decodedData = decodeTreatData(encodedData);
      if (decodedData) {
        console.log('Successfully decoded data from URL');
        return decodedData;
      }
    }

    // Try fallback storage with ID
    const treatId = urlParams.get('id');
    if (treatId) {
      console.log('Found treat ID in URL, checking localStorage:', treatId);
      const storageKey = `treat_${treatId}`;
      
      try {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('Successfully retrieved data from localStorage');
          return parsedData;
        } else {
          console.log('No data found in localStorage for key:', storageKey);
        }
      } catch (storageError) {
        console.error('Error reading from localStorage:', storageError);
      }
    }

    console.log('No valid treat data found in URL or storage');
    return null;

  } catch (error) {
    console.error('Error retrieving treat data:', error);
    return null;
  }
}
