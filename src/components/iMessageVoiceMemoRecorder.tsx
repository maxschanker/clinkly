import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Pause, Upload, X, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadVoiceMemo } from '@/lib/treatService';
import { cn } from '@/lib/utils';

interface iMessageVoiceMemoRecorderProps {
  onVoiceMemoChange: (url: string | null) => void;
  existingUrl?: string | null;
}

type RecorderState = 'initial' | 'pre-record' | 'recording' | 'post-record' | 'completed';

export const IMessageVoiceMemoRecorder: React.FC<iMessageVoiceMemoRecorderProps> = ({
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
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(20).fill(1));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waveformAnimationRef = useRef<NodeJS.Timeout | null>(null);
  
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
      if (waveformAnimationRef.current) clearInterval(waveformAnimationRef.current);
    };
  }, []);

  const animateWaveform = () => {
    if (waveformAnimationRef.current) clearInterval(waveformAnimationRef.current);
    
    waveformAnimationRef.current = setInterval(() => {
      setWaveformBars(prev => prev.map(() => Math.random() * 100 + 10));
    }, 150);
  };

  const stopWaveformAnimation = () => {
    if (waveformAnimationRef.current) {
      clearInterval(waveformAnimationRef.current);
      waveformAnimationRef.current = null;
    }
  };

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
        stopWaveformAnimation();
        setState('post-record');
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setState('recording');
      animateWaveform();
      
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

  const renderWaveform = (isStatic = false) => (
    <div className="flex items-center gap-1 h-8 px-2">
      {waveformBars.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-1 bg-primary rounded-full transition-all duration-150",
            isStatic ? "opacity-60" : "opacity-100"
          )}
          style={{ 
            height: isStatic ? `${Math.min(height * 0.6, 24)}px` : `${Math.min(height * 0.8, 32)}px` 
          }}
        />
      ))}
    </div>
  );

  // Initial State: "🎤️ Voice Memo" + plus button
  if (state === 'initial') {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-accent/50 transition-all duration-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎤</span>
          <span className="text-sm font-medium text-foreground">Voice Memo</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setState('pre-record')}
          className="w-6 h-6 p-0 hover:bg-primary/10"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Pre-Record State: "Record your memo" + record button
  if (state === 'pre-record') {
    return (
      <div className="p-4 rounded-lg border border-border bg-background space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Record your memo</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setState('initial')}
            className="w-6 h-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex justify-center">
          <Button
            variant="default"
            size="lg"
            onClick={startRecording}
            className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Mic className="w-6 h-6" />
          </Button>
        </div>
      </div>
    );
  }

  // Recording State: iMessage-style with animated waveform
  if (state === 'recording') {
    return (
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-4 animate-scale-in">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary">Recording...</span>
          <span className="text-sm font-mono text-primary">{formatTime(recordingTime)}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="destructive"
            size="lg"
            onClick={stopRecording}
            className="w-12 h-12 rounded-full animate-pulse shadow-lg"
          >
            <MicOff className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 bg-background/50 rounded-lg overflow-hidden">
            {renderWaveform()}
          </div>
        </div>
      </div>
    );
  }

  // Post-Record State: playback controls
  if (state === 'post-record') {
    return (
      <div className="p-4 rounded-lg border border-border bg-background space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Voice Memo</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">
              {formatTime(isPlaying ? playbackTime : recordingTime)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteRecording}
              className="w-6 h-6 p-0 text-destructive hover:bg-destructive/10"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={playRecording}
            className="w-10 h-10 rounded-full"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <div className="flex-1 bg-muted/30 rounded-lg overflow-hidden">
            {renderWaveform(true)}
          </div>
          
          <Button
            variant="default"
            size="sm"
            onClick={handleUpload}
            disabled={isUploading}
            className="w-10 h-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Completed State: "✅ Memo Recorded!" + Edit button
  if (state === 'completed') {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20 animate-fade-in">
        <div className="flex items-center gap-2">
          <span className="text-lg">✅</span>
          <span className="text-sm font-medium text-success">Memo Recorded!</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={editRecording}
          className="text-xs text-muted-foreground hover:text-foreground hover:bg-background/50"
        >
          <Edit className="w-3 h-3 mr-1" />
          Edit
        </Button>
      </div>
    );
  }

  return null;
};