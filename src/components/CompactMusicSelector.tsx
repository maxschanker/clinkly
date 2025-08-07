import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Music, Play, Square } from "lucide-react";
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

  const handleSongSelect = (song: Song) => {
    onSongChange(song);
    setShowMusicModal(false);
    setIsPlaying(false);
  };

  const handleRemoveSong = () => {
    onSongChange(null);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

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
        {/* Thumbnail with play/stop button overlay */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <img
            src={selectedSong.thumbnailUrl}
            alt={selectedSong.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={togglePlayback}
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          >
            {isPlaying ? (
              <Square className="h-4 w-4 text-white fill-white" />
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

      <MusicSearchModal
        open={showMusicModal}
        onOpenChange={setShowMusicModal}
        onSongSelect={handleSongSelect}
      />
    </>
  );
}