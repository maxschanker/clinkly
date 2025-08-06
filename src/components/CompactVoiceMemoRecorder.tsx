import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Pause, Upload, X, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadVoiceMemo } from '@/lib/treatService';
import { cn } from '@/lib/utils';

interface CompactVoiceMemoRecorderProps {
  onVoiceMemoChange: (url: string | null) => void;
  existingUrl?: string | null;
}

type RecorderState = 'initial' | 'pre-record' | 'recording' | 'post-record' | 'completed';

export const CompactVoiceMemoRecorder: React.FC<CompactVoiceMemoRecorderProps> = ({
  onVoiceMemoChange,
  existingUrl
}) => {
  const [state, setState] = useState<RecorderState>(existingUrl ? 'completed' : 'initial');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (existingUrl) {
      setUploadedUrl(existingUrl);
      setState('completed');
    }
  }, [existingUrl]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, []);


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
        setState('post-record');
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setState('recording');
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Can't access mic",
        description: "Please allow microphone access to record.",
      });
      setState('pre-record');
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
    if (recordedBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(recordedBlob);
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setPlaybackTime(0);
        if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      };
      
      audioRef.current.play();
      setIsPlaying(true);
      setPlaybackTime(0);
      
      playbackTimerRef.current = setInterval(() => {
        setPlaybackTime(prev => prev + 1);
      }, 1000);
    } else if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }
  };

  const deleteRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setPlaybackTime(0);
    setIsPlaying(false);
    setState('pre-record');
    onVoiceMemoChange(null);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
  };

  const handleUpload = async () => {
    if (!recordedBlob) return;
    
    setIsUploading(true);
    
    try {
      const { file_url } = await uploadVoiceMemo(recordedBlob);
      setUploadedUrl(file_url);
      onVoiceMemoChange(file_url);
      setState('completed');
      
      toast({
        title: "Voice memo uploaded! 🎤",
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

  const editRecording = () => {
    setState('initial');
    setUploadedUrl(null);
    setRecordedBlob(null);
    setRecordingTime(0);
    setPlaybackTime(0);
    onVoiceMemoChange(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  // Initial State: Ultra-compact layout
  if (state === 'initial') {
    return (
      <div className="flex items-center gap-1 p-1 rounded border border-border bg-background hover:bg-accent/50 transition-all max-w-20">
        <span className="text-xs">🎤</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setState('pre-record')}
          className="w-4 h-4 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  // Pre-Record State: Ultra-compact layout
  if (state === 'pre-record') {
    return (
      <div className="flex items-center gap-1 p-1 rounded border border-border bg-background max-w-20">
        <Button
          variant="default"
          size="sm"
          onClick={startRecording}
          className="w-5 h-5 rounded-full"
        >
          <Mic className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setState('initial')}
          className="w-4 h-4 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  // Recording State: Ultra-compact layout
  if (state === 'recording') {
    return (
      <div className="flex items-center gap-1 p-1 rounded bg-primary/5 border border-primary/20 max-w-20">
        <Button
          variant="destructive"
          size="sm"
          onClick={stopRecording}
          className="w-5 h-5 rounded-full animate-pulse"
        >
          <MicOff className="w-3 h-3" />
        </Button>
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
        <span className="text-xs font-mono text-primary">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
      </div>
    );
  }

  // Post-Record State: Ultra-compact layout with controls
  if (state === 'post-record') {
    return (
      <div className="flex items-center gap-1 p-1 rounded border border-border bg-background max-w-20">
        <Button
          variant="outline"
          size="sm"
          onClick={playRecording}
          className="w-4 h-4 rounded-full p-0"
        >
          {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={handleUpload}
          disabled={isUploading}
          className="w-4 h-4 rounded-full p-0"
        >
          <Upload className="w-2.5 h-2.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={deleteRecording}
          className="w-4 h-4 p-0 text-destructive"
        >
          <X className="w-2.5 h-2.5" />
        </Button>
      </div>
    );
  }

  // Completed State: Ultra-compact layout
  if (state === 'completed') {
    return (
      <div className="flex items-center gap-1 p-1 rounded bg-success/10 border border-success/20 max-w-20">
        <span className="text-xs">✅</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={editRecording}
          className="w-4 h-4 p-0 text-muted-foreground hover:text-foreground"
        >
          <Edit className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return null;
};