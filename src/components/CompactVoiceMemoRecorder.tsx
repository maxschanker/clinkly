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


  // Initial State: Compact horizontal layout
  if (state === 'initial') {
    return (
      <div className="flex items-center justify-between p-1.5 rounded-md border border-border bg-background hover:bg-accent/50 transition-all duration-200">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🎤</span>
          <span className="text-xs font-medium text-foreground">Voice</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setState('pre-record')}
          className="w-4 h-4 p-0 hover:bg-primary/10"
        >
          <Plus className="w-2.5 h-2.5" />
        </Button>
      </div>
    );
  }

  // Pre-Record State: Compact layout
  if (state === 'pre-record') {
    return (
      <div className="flex items-center justify-between p-1.5 rounded-md border border-border bg-background space-x-1.5 animate-fade-in">
        <Button
          variant="default"
          size="sm"
          onClick={startRecording}
          className="w-6 h-6 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Mic className="w-2.5 h-2.5" />
        </Button>
        <span className="text-xs font-medium text-foreground flex-1 text-center">Record</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setState('initial')}
          className="w-4 h-4 p-0"
        >
          <X className="w-2.5 h-2.5" />
        </Button>
      </div>
    );
  }

  // Recording State: Compact layout with timer
  if (state === 'recording') {
    return (
      <div className="flex items-center gap-1.5 p-1.5 rounded-md bg-primary/5 border border-primary/20 animate-scale-in">
        <Button
          variant="destructive"
          size="sm"
          onClick={stopRecording}
          className="w-6 h-6 rounded-full animate-pulse shadow-sm"
        >
          <MicOff className="w-2.5 h-2.5" />
        </Button>
        
        <div className="flex-1 flex items-center gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-primary">Recording</span>
        </div>
        
        <span className="text-xs font-mono text-primary min-w-[30px]">{formatTime(recordingTime)}</span>
      </div>
    );
  }

  // Post-Record State: Compact layout with controls
  if (state === 'post-record') {
    return (
      <div className="flex items-center gap-1.5 p-1.5 rounded-md border border-border bg-background animate-fade-in">
        <Button
          variant="outline"
          size="sm"
          onClick={playRecording}
          className="w-6 h-6 rounded-full"
        >
          {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
        </Button>
        
        <div className="flex-1 flex items-center gap-1">
          <span className="text-xs font-medium text-foreground">Audio</span>
          <span className="text-xs font-mono text-muted-foreground">
            {formatTime(isPlaying ? playbackTime : recordingTime)}
          </span>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="default"
            size="sm"
            onClick={handleUpload}
            disabled={isUploading}
            className="w-6 h-6 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Upload className="w-2.5 h-2.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={deleteRecording}
            className="w-4 h-4 p-0 text-destructive hover:bg-destructive/10"
          >
            <X className="w-2.5 h-2.5" />
          </Button>
        </div>
      </div>
    );
  }

  // Completed State: Compact layout with success indicator
  if (state === 'completed') {
    return (
      <div className="flex items-center justify-between p-1.5 rounded-md bg-success/10 border border-success/20 animate-fade-in">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">✅</span>
          <span className="text-xs font-medium text-success">Recorded</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={editRecording}
          className="text-xs text-muted-foreground hover:text-foreground hover:bg-background/50 h-5 px-1.5"
        >
          <Edit className="w-2.5 h-2.5 mr-1" />
          Edit
        </Button>
      </div>
    );
  }

  return null;
};