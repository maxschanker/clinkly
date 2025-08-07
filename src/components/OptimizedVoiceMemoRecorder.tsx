import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Play, Upload, Trash2 } from "lucide-react";
import { uploadVoiceMemo } from "@/lib/treatService";
import { audioDiagnostics, type AudioDiagnosticResult } from "@/lib/audioDiagnostics";
import OptimizedAudioPlayer from "./OptimizedAudioPlayer";

interface OptimizedVoiceMemoRecorderProps {
  onVoiceMemoChange: (url: string | null) => void;
  existingUrl?: string | null;
}

interface RecorderState {
  mode: 'idle' | 'recording' | 'recorded' | 'uploading' | 'uploaded';
  recordingTime: number;
  error?: string;
}

const OptimizedVoiceMemoRecorder = ({ 
  onVoiceMemoChange, 
  existingUrl 
}: OptimizedVoiceMemoRecorderProps) => {
  const [state, setState] = useState<RecorderState>({
    mode: existingUrl ? 'uploaded' : 'idle',
    recordingTime: 0
  });
  
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingUrl || null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const updateState = useCallback((updates: Partial<RecorderState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setState(prev => ({ ...prev, recordingTime: prev.recordingTime + 1 }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Starting optimized recording');
      
      // Get optimal recording configuration
      const config = audioDiagnostics.getOptimalRecorderConfig();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });

      // Check if the desired format is supported
      if (!MediaRecorder.isTypeSupported(config.mimeType)) {
        console.warn(`⚠️ ${config.mimeType} not supported, falling back to default`);
        mediaRecorderRef.current = new MediaRecorder(stream);
      } else {
        mediaRecorderRef.current = new MediaRecorder(stream, config);
      }

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('🎤 Recording stopped, processing...');
        
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
        });
        
        console.log('🎤 Recorded blob:', {
          size: blob.size,
          type: blob.type,
          chunks: chunksRef.current.length
        });

        // Validate the recorded audio
        const validation = await audioDiagnostics.validateAudioFile(blob);
        console.log('🔍 Recording validation:', validation);

        if (!validation.isValid) {
          updateState({ 
            mode: 'idle', 
            error: `Recording invalid: ${validation.errors.join(', ')}`
          });
          toast({
            title: "Recording Error",
            description: "The recording is invalid. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (validation.warnings.length > 0) {
          console.warn('⚠️ Recording warnings:', validation.warnings);
        }

        setRecordedBlob(blob);
        updateState({ mode: 'recorded', error: undefined });
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      updateState({ mode: 'recording', recordingTime: 0, error: undefined });
      startTimer();

    } catch (error) {
      console.error('🚫 Recording start failed:', error);
      updateState({ 
        mode: 'idle', 
        error: 'Failed to start recording' 
      });
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [updateState, startTimer, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.mode === 'recording') {
      console.log('🎤 Stopping recording');
      mediaRecorderRef.current.stop();
      stopTimer();
    }
  }, [state.mode, stopTimer]);

  const deleteRecording = useCallback(() => {
    console.log('🗑️ Deleting recording');
    setRecordedBlob(null);
    setUploadedUrl(null);
    updateState({ mode: 'idle', recordingTime: 0, error: undefined });
    onVoiceMemoChange(null);
  }, [updateState, onVoiceMemoChange]);

  const uploadRecording = useCallback(async () => {
    if (!recordedBlob) return;

    updateState({ mode: 'uploading', error: undefined });

    try {
      console.log('📤 Uploading recording');
      const result = await uploadVoiceMemo(recordedBlob);
      
      setUploadedUrl(result.file_url);
      updateState({ mode: 'uploaded' });
      onVoiceMemoChange(result.file_url);
      
      toast({
        title: "Voice memo uploaded",
        description: "Your recording has been saved successfully.",
      });
    } catch (error) {
      console.error('🚫 Upload failed:', error);
      updateState({ 
        mode: 'recorded', 
        error: 'Upload failed' 
      });
      toast({
        title: "Upload Error",
        description: "Failed to upload voice memo. Please try again.",
        variant: "destructive",
      });
    }
  }, [recordedBlob, updateState, onVoiceMemoChange, toast]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (state.mode) {
      case 'idle':
        return (
          <div className="flex flex-col items-center gap-4 p-6">
            <Button
              onClick={startRecording}
              size="lg"
              className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90"
            >
              <Mic className="w-6 h-6" />
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Tap to record your voice memo
            </p>
            {state.error && (
              <p className="text-sm text-destructive text-center">{state.error}</p>
            )}
          </div>
        );

      case 'recording':
        return (
          <div className="flex flex-col items-center gap-4 p-6">
            <div className="relative">
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="w-16 h-16 rounded-full"
              >
                <Square className="w-6 h-6 fill-current" />
              </Button>
              <div className="absolute -inset-2 border-2 border-destructive rounded-full animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Recording...</p>
              <p className="text-lg font-mono">{formatTime(state.recordingTime)}</p>
            </div>
          </div>
        );

      case 'recorded':
        return (
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Recording ready ({formatTime(state.recordingTime)})
              </span>
              <Button
                onClick={deleteRecording}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive/80"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            {recordedBlob && (
              <OptimizedAudioPlayer 
                voiceMemoUrl={URL.createObjectURL(recordedBlob)} 
                variant="full"
              />
            )}
            
            <Button onClick={uploadRecording} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Save Voice Memo
            </Button>
            
            {state.error && (
              <p className="text-sm text-destructive text-center">{state.error}</p>
            )}
          </div>
        );

      case 'uploading':
        return (
          <div className="flex flex-col items-center gap-4 p-6">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Saving voice memo...</p>
          </div>
        );

      case 'uploaded':
        return (
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">Voice memo saved</span>
              <Button
                onClick={deleteRecording}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive/80"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            {uploadedUrl && (
              <OptimizedAudioPlayer 
                voiceMemoUrl={uploadedUrl} 
                variant="full"
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      {renderContent()}
    </Card>
  );
};

export default OptimizedVoiceMemoRecorder;