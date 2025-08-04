import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Constants for URL length management
const MAX_URL_LENGTH = 2000; // Conservative limit for browser compatibility
const MAX_ENCODED_DATA_LENGTH = 1500; // Leave room for base URL and parameters

// Unicode-safe base64 encoding helpers
function unicodeSafeBase64Encode(str: string): string {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(str);
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

function unicodeSafeBase64Decode(base64: string): string {
  const binary = atob(base64);
  const uint8Array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    uint8Array[i] = binary.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return decoder.decode(uint8Array);
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
    console.log('JSON string to encode (length: %d, preview: %s)', jsonString.length, jsonString.substring(0, 100));
    
    // Use Unicode-safe encoding
    const encoded = unicodeSafeBase64Encode(jsonString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    console.log('Encoded data length:', encoded.length);
    
    return encoded;
  } catch (error) {
    console.error('Error encoding treat data:', error);
    console.error('Data that caused error:', JSON.stringify(data, null, 2));
    return '';
  }
}

export function decodeTreatData(encoded: string): any | null {
  try {
    if (!encoded || typeof encoded !== 'string') {
      console.error('Invalid encoded string:', encoded);
      return null;
    }
    
    console.log('Attempting to decode (length: %d, preview: %s)', encoded.length, encoded.substring(0, 50));
    
    // Add padding back if needed
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    console.log('Base64 after padding (length: %d)', base64.length);
    
    // Use Unicode-safe decoding
    const jsonString = unicodeSafeBase64Decode(base64);
    console.log('Decoded JSON string (length: %d, preview: %s)', jsonString.length, jsonString.substring(0, 100));
    
    const decoded = JSON.parse(jsonString);
    console.log('Successfully decoded treat data:', { 
      hasSlug: !!decoded.slug, 
      hasSenderName: !!decoded.senderName, 
      hasMessage: !!decoded.message,
      keys: Object.keys(decoded)
    });
    
    return decoded;
  } catch (error) {
    console.error('Error decoding treat data:', error);
    console.error('Encoded string that caused error (length: %d): %s', encoded.length, encoded.substring(0, 100));
    return null;
  }
}

// Generate a unique ID for stored treats
function generateTreatId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Generate a session ID for data validation
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

// Constants for data freshness
const DATA_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes
const CURRENT_SESSION_KEY = 'clink_current_session';

// Enhanced treat data storage with metadata
interface TreatDataWithMetadata {
  data: any;
  timestamp: number;
  sessionId: string;
  version: string;
}

// Initialize or get current session
export function getCurrentSession(): string {
  let sessionId = localStorage.getItem(CURRENT_SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    console.log('Created new session:', sessionId);
  }
  return sessionId;
}

// Enhanced localStorage operations with metadata
export function saveTreatData(key: string, data: any): void {
  try {
    const sessionId = getCurrentSession();
    const metadata: TreatDataWithMetadata = {
      data,
      timestamp: Date.now(),
      sessionId,
      version: '1.0'
    };
    
    localStorage.setItem(key, JSON.stringify(metadata));
    console.log('Saved treat data with metadata:', { key, sessionId, timestamp: metadata.timestamp });
  } catch (error) {
    console.error('Failed to save treat data:', error);
  }
}

export function loadTreatData(key: string): any | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      console.log('No data found for key:', key);
      return null;
    }

    const metadata: TreatDataWithMetadata = JSON.parse(stored);
    const currentTime = Date.now();
    const currentSession = getCurrentSession();

    // Check data freshness
    if (currentTime - metadata.timestamp > DATA_EXPIRY_TIME) {
      console.log('Data expired, removing:', { key, age: currentTime - metadata.timestamp });
      localStorage.removeItem(key);
      return null;
    }

    // Check session validity
    if (metadata.sessionId !== currentSession) {
      console.log('Data from different session, removing:', { key, dataSession: metadata.sessionId, currentSession });
      localStorage.removeItem(key);
      return null;
    }

    console.log('Loaded fresh treat data:', { key, age: currentTime - metadata.timestamp });
    return metadata.data;
  } catch (error) {
    console.error('Failed to load treat data:', error);
    localStorage.removeItem(key);
    return null;
  }
}

// Clean up expired or stale data
export function cleanupStaleData(): void {
  try {
    const currentTime = Date.now();
    const currentSession = getCurrentSession();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || (!key.startsWith('treat_') && key !== 'treatData')) continue;

      try {
        const stored = localStorage.getItem(key);
        if (!stored) continue;

        const metadata: TreatDataWithMetadata = JSON.parse(stored);
        
        // Remove expired or different session data
        if (currentTime - metadata.timestamp > DATA_EXPIRY_TIME || 
            metadata.sessionId !== currentSession) {
          keysToRemove.push(key);
        }
      } catch {
        // Remove corrupted data
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('Cleaned up stale data:', key);
    });

    if (keysToRemove.length > 0) {
      console.log('Cleanup completed, removed keys:', keysToRemove);
    }
  } catch (error) {
    console.error('Failed to cleanup stale data:', error);
  }
}

// Clear all treat data for the current session
export function clearAllTreatData(): void {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('treat_') || key === 'treatData')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('Cleared all treat data:', keysToRemove);
  } catch (error) {
    console.error('Failed to clear treat data:', error);
  }
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
