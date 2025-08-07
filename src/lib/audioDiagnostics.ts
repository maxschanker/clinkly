interface AudioDiagnosticResult {
  isValid: boolean;
  format: string;
  duration: number | null;
  hasMetadata: boolean;
  size: number;
  codec?: string;
  errors: string[];
  warnings: string[];
}

interface AudioInfo {
  canPlay: boolean;
  format: string;
  confidence: 'probably' | 'maybe' | '';
}

class AudioDiagnostics {
  private static instance: AudioDiagnostics;
  private supportedFormats: Map<string, AudioInfo> = new Map();

  static getInstance(): AudioDiagnostics {
    if (!AudioDiagnostics.instance) {
      AudioDiagnostics.instance = new AudioDiagnostics();
    }
    return AudioDiagnostics.instance;
  }

  constructor() {
    this.detectSupportedFormats();
  }

  private detectSupportedFormats() {
    const audio = new Audio();
    const formats = [
      { type: 'audio/webm; codecs="opus"', ext: 'webm' },
      { type: 'audio/mp4; codecs="mp4a.40.2"', ext: 'mp4' },
      { type: 'audio/mpeg', ext: 'mp3' },
      { type: 'audio/wav', ext: 'wav' },
      { type: 'audio/ogg; codecs="vorbis"', ext: 'ogg' }
    ];

    formats.forEach(({ type, ext }) => {
      const confidence = audio.canPlayType(type) as 'probably' | 'maybe' | '';
      this.supportedFormats.set(ext, {
        canPlay: confidence !== '',
        format: type,
        confidence
      });
    });

    console.log('🎵 Supported audio formats:', Object.fromEntries(this.supportedFormats));
  }

  getBestFormat(): string {
    // Prioritize formats with 'probably' support
    for (const [ext, info] of this.supportedFormats.entries()) {
      if (info.confidence === 'probably') {
        console.log(`🎯 Best format selected: ${ext} (${info.confidence})`);
        return ext;
      }
    }

    // Fallback to 'maybe' support
    for (const [ext, info] of this.supportedFormats.entries()) {
      if (info.confidence === 'maybe') {
        console.log(`🎯 Fallback format selected: ${ext} (${info.confidence})`);
        return ext;
      }
    }

    console.warn('⚠️ No optimal format found, defaulting to webm');
    return 'webm';
  }

  async validateAudioFile(file: Blob): Promise<AudioDiagnosticResult> {
    const result: AudioDiagnosticResult = {
      isValid: false,
      format: 'unknown',
      duration: null,
      hasMetadata: false,
      size: file.size,
      errors: [],
      warnings: []
    };

    try {
      // Create temporary audio element for validation
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      const validationPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Validation timeout'));
        }, 5000);

        audio.onloadedmetadata = () => {
          clearTimeout(timeout);
          result.duration = audio.duration;
          result.hasMetadata = !isNaN(audio.duration) && audio.duration > 0;
          result.isValid = true;
          resolve();
        };

        audio.onerror = () => {
          clearTimeout(timeout);
          reject(new Error(`Audio validation failed: ${audio.error?.message || 'Unknown error'}`));
        };

        audio.src = url;
      });

      await validationPromise;
      URL.revokeObjectURL(url);

      // Determine format from MIME type or file signature
      result.format = this.detectFormat(file);

      // Additional validations
      if (result.size === 0) {
        result.errors.push('File is empty');
        result.isValid = false;
      }

      if (result.size > 10 * 1024 * 1024) { // 10MB
        result.warnings.push('File size is large (>10MB)');
      }

      if (!result.hasMetadata) {
        result.warnings.push('Missing or invalid metadata');
      }

      if (result.duration === null || result.duration === 0) {
        result.errors.push('Invalid or missing duration');
        result.isValid = false;
      }

      console.log('🔍 Audio validation result:', result);
      
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Validation failed');
      result.isValid = false;
      console.error('🚫 Audio validation error:', error);
    }

    return result;
  }

  private detectFormat(file: Blob): string {
    if (file.type) {
      if (file.type.includes('webm')) return 'webm';
      if (file.type.includes('mp4')) return 'mp4';
      if (file.type.includes('mpeg')) return 'mp3';
      if (file.type.includes('wav')) return 'wav';
      if (file.type.includes('ogg')) return 'ogg';
    }
    return 'unknown';
  }

  async testAudioUrl(url: string): Promise<{
    canLoad: boolean;
    duration: number | null;
    error?: string;
    networkInfo: {
      responseTime: number;
      status: number;
      contentLength?: number;
      contentType?: string;
    };
  }> {
    const startTime = performance.now();
    
    try {
      // First, test network accessibility
      const response = await fetch(url, { method: 'HEAD' });
      const responseTime = performance.now() - startTime;
      
      const networkInfo = {
        responseTime,
        status: response.status,
        contentLength: response.headers.get('content-length') ? 
          parseInt(response.headers.get('content-length')!) : undefined,
        contentType: response.headers.get('content-type') || undefined
      };

      if (!response.ok) {
        return {
          canLoad: false,
          duration: null,
          error: `HTTP ${response.status}`,
          networkInfo
        };
      }

      // Test audio loading
      const audio = new Audio();
      const loadPromise = new Promise<number | null>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio load timeout'));
        }, 10000);

        audio.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve(audio.duration);
        };

        audio.onerror = () => {
          clearTimeout(timeout);
          reject(new Error(`Audio load error: ${audio.error?.message || 'Unknown'}`));
        };

        audio.src = url;
      });

      const duration = await loadPromise;
      
      return {
        canLoad: true,
        duration,
        networkInfo
      };

    } catch (error) {
      return {
        canLoad: false,
        duration: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        networkInfo: {
          responseTime: performance.now() - startTime,
          status: 0
        }
      };
    }
  }

  getOptimalRecorderConfig(): MediaRecorderOptions {
    const bestFormat = this.getBestFormat();
    
    const configs = {
      webm: {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 64000
      },
      mp4: {
        mimeType: 'audio/mp4;codecs=mp4a.40.2',
        audioBitsPerSecond: 64000
      },
      mp3: {
        mimeType: 'audio/mpeg',
        audioBitsPerSecond: 64000
      }
    };

    const config = configs[bestFormat as keyof typeof configs] || configs.webm;
    console.log('🎤 Optimal recorder config:', config);
    
    return config;
  }
}

export const audioDiagnostics = AudioDiagnostics.getInstance();
export type { AudioDiagnosticResult };