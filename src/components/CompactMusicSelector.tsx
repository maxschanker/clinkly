import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Music, Play, Pause, Square } from "lucide-react";
import { MusicSearchModal } from "@/components/MusicSearchModal";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration: string;
}

interface CompactMusicSelectorProps {
  onSongChange: (song: Song | null) => void;
  selectedSong?: Song | null;
}

export function CompactMusicSelector({ onSongChange, selectedSong }: CompactMusicSelectorProps) {
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const embedUrl = selectedSong ? 
    `https://www.youtube.com/embed/${selectedSong.id}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&controls=0&modestbranding=1&rel=0&showinfo=0&autoplay=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&mute=1` : '';

  const sendPlayerCommand = useCallback((command: string, args: string = "") => {
    if (!iframeRef.current) return false;
    
    try {
      const message = JSON.stringify({
        event: "command",
        func: command,
        args: args
      });
      
      iframeRef.current.contentWindow?.postMessage(message, '*');
      return true;
    } catch (error) {
      console.error('Error sending player command:', error);
      return false;
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (!playerReady || !selectedSong) return;
    
    if (isPlaying) {
      sendPlayerCommand('pauseVideo');
    } else {
      sendPlayerCommand('unMute');
      setTimeout(() => {
        sendPlayerCommand('playVideo');
      }, 50);
    }
  }, [isPlaying, playerReady, selectedSong, sendPlayerCommand]);

  const handleSongSelect = (song: Song) => {
    onSongChange(song);
    setShowMusicModal(false);
    setIsPlaying(false);
    setPlayerReady(false);
  };

  const handleRemoveSong = () => {
    onSongChange(null);
    setIsPlaying(false);
    setPlayerReady(false);
  };

  // Handle YouTube player events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = JSON.parse(event.data);
        
        if (data.event === 'onReady') {
          setPlayerReady(true);
          if (selectedSong) {
            sendPlayerCommand('cueVideoById', selectedSong.id);
          }
        } else if (data.event === 'onStateChange') {
          const playerState = data.info;
          setIsPlaying(playerState === 1); // 1 = playing, 2 = paused
        }
      } catch (error) {
        // Ignore parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedSong, sendPlayerCommand]);

  // Reset state when song changes
  useEffect(() => {
    if (selectedSong && playerReady) {
      sendPlayerCommand('cueVideoById', selectedSong.id);
      setIsPlaying(false);
    }
  }, [selectedSong?.id, playerReady, sendPlayerCommand]);

  if (!selectedSong) {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setShowMusicModal(true)}
          className="w-full justify-start gap-3 h-12 bg-card hover:bg-accent border-dashed border-2"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
            <Music className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-muted-foreground">Add music</span>
        </Button>
        
        <MusicSearchModal
          open={showMusicModal}
          onOpenChange={setShowMusicModal}
          onSongSelect={handleSongSelect}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-card border rounded-lg">
        {/* Thumbnail with play button overlay */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <img
            src={selectedSong.thumbnailUrl}
            alt={selectedSong.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={togglePlayback}
            disabled={!playerReady}
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 text-white fill-white" />
            ) : (
              <Play className="h-4 w-4 text-white fill-white" />
            )}
          </button>
        </div>

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{selectedSong.title}</p>
          <p className="text-xs text-muted-foreground truncate">{selectedSong.artist}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMusicModal(true)}
            className="h-8 text-xs"
          >
            Change
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveSong}
            className="h-8 text-xs text-muted-foreground"
          >
            Remove
          </Button>
        </div>
      </div>

      {/* Hidden YouTube player for preview */}
      {selectedSong && (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          style={{ display: 'none' }}
          allow="autoplay; encrypted-media"
        />
      )}

      <MusicSearchModal
        open={showMusicModal}
        onOpenChange={setShowMusicModal}
        onSongSelect={handleSongSelect}
      />
    </>
  );
}