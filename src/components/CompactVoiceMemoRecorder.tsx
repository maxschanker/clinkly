import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadVoiceMemo } from '@/lib/treatService';

interface CompactVoiceMemoRecorderProps {
  onVoiceMemoChange: (url: string | null) => void;
  existingUrl?: string | null;
}

export const CompactVoiceMemoRecorder: React.FC<CompactVoiceMemoRecorderProps> = ({
  onVoiceMemoChange,
  existingUrl
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingUrl || null);
  const [showRecorder, setShowRecorder] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    if (existingUrl) {
      setUploadedUrl(existingUrl);
    }
  }, [existingUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        
        // Auto-upload after recording
        await handleUpload(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Can't access mic",
        description: "Please allow microphone access to record.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleUpload = async (blob: Blob) => {
    setIsUploading(true);
    
    try {
      const { file_url } = await uploadVoiceMemo(blob);
      setUploadedUrl(file_url);
      onVoiceMemoChange(file_url);
      setShowRecorder(false);
      
      toast({
        title: "Voice memo added! 🎤",
        description: "Your message has been attached.",
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Try recording again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeVoiceMemo = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setUploadedUrl(null);
    setShowRecorder(false);
    onVoiceMemoChange(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If already has voice memo, show compact indicator
  if (uploadedUrl) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-xl bg-primary/10 border border-primary/20">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">Voice memo attached</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={removeVoiceMemo}
          className="w-6 h-6 p-0 text-muted-foreground hover:text-destructive"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  // Toggle view for recording
  if (!showRecorder) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowRecorder(true)}
        className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
      >
        <Mic className="w-4 h-4 mr-2" />
        Add voice memo
      </Button>
    );
  }

  // Recording interface
  return (
    <div className="p-3 rounded-xl bg-background border border-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Voice Memo</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowRecorder(false)}
          className="w-6 h-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        {!isRecording ? (
          <Button
            variant="default"
            size="lg"
            onClick={startRecording}
            disabled={isUploading}
            className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Mic className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="lg"
            onClick={stopRecording}
            className="w-12 h-12 rounded-full animate-pulse shadow-lg"
          >
            <MicOff className="w-5 h-5" />
          </Button>
        )}
        
        <div className="flex-1">
          {isRecording ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }} />
              </div>
              <span className="text-sm font-mono text-muted-foreground min-w-[3rem]">
                {formatTime(recordingTime)}
              </span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {isUploading ? "Uploading..." : "Tap to start recording"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};