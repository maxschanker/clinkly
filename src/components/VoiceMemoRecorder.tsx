import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, Play, Pause, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadVoiceMemo } from '@/lib/treatService';

interface VoiceMemoRecorderProps {
  onVoiceMemoChange: (url: string | null) => void;
  existingUrl?: string | null;
}

export const VoiceMemoRecorder: React.FC<VoiceMemoRecorderProps> = ({
  onVoiceMemoChange,
  existingUrl
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingUrl || null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
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

  const playRecording = () => {
    if (recordedBlob) {
      const audioUrl = URL.createObjectURL(recordedBlob);
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setUploadedUrl(null);
    onVoiceMemoChange(null);
    
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleUploadVoiceMemo = async () => {
    if (!recordedBlob) return;
    
    setIsUploading(true);
    
    try {
      const { file_url } = await uploadVoiceMemo(recordedBlob);
      setUploadedUrl(file_url);
      onVoiceMemoChange(file_url);
      
      toast({
        title: "Voice memo uploaded",
        description: "Your voice memo has been attached to the clink.",
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Failed to upload voice memo. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasRecording = recordedBlob || uploadedUrl;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Voice Memo</h3>
        {hasRecording && (
          <Button
            variant="ghost"
            size="sm"
            onClick={deleteRecording}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Recording Controls */}
      {!uploadedUrl && (
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Button
              variant="outline"
              size="sm"
              onClick={startRecording}
              disabled={isUploading}
            >
              <Mic className="h-4 w-4 mr-2" />
              Record
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={stopRecording}
            >
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}
          
          {isRecording && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {formatTime(recordingTime)}
            </div>
          )}
        </div>
      )}

      {/* Playback Controls */}
      {recordedBlob && !uploadedUrl && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={isPlaying ? pausePlayback : playRecording}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={handleUploadVoiceMemo}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      )}

      {/* Uploaded Voice Memo */}
      {uploadedUrl && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Voice memo attached</div>
          <audio controls className="w-full">
            <source src={uploadedUrl} type="audio/webm" />
            <source src={uploadedUrl} type="audio/mp3" />
            Your browser does not support audio playback.
          </audio>
        </div>
      )}
    </Card>
  );
};