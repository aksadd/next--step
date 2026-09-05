import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Slider } from "@/components/ui/slider";
import { formatClock } from "@/lib/format";
import { cn } from "@/lib/utils";

const SPEEDS = [1, 1.25, 1.5, 2];

export function AudioPlayer({
  src,
  title,
  className,
  onPlay,
}: {
  src?: string | null;
  title: string;
  className?: string;
  onPlay?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
  }, [src]);

  if (!src) {
    return (
      <div
        className={cn(
          "surface-card flex items-center gap-3 rounded-lg px-5 py-4 text-sm text-muted-foreground",
          className,
        )}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <Play className="h-4 w-4" aria-hidden="true" />
        </span>
        Audio coming soon.
      </div>
    );
  }

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play();
      onPlay?.();
    } else {
      audio.pause();
    }
  };

  return (
    <div className={cn("surface-card rounded-lg p-4 sm:p-5", className)}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
      />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>

        <div className="min-w-0 flex-1">
          <Slider
            value={[duration ? (current / duration) * 100 : 0]}
            max={100}
            step={0.1}
            aria-label="Seek"
            onValueChange={([value]) => {
              const audio = audioRef.current;
              if (audio && duration) audio.currentTime = (value / 100) * duration;
            }}
          />
          <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-muted-foreground">
            <span>{formatClock(current)}</span>
            <span>{duration ? formatClock(duration) : "--:--"}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => {
            const audio = audioRef.current;
            if (!audio) return;
            audio.muted = !audio.muted;
            setMuted(audio.muted);
          }}
          aria-label={muted ? "Unmute" : "Mute"}
          className="text-muted-foreground hover:text-foreground"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <div className="w-24">
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            aria-label="Volume"
            onValueChange={([value]) => {
              const audio = audioRef.current;
              setVolume(value / 100);
              if (audio) audio.volume = value / 100;
            }}
          />
        </div>
        <div className="ml-auto flex items-center gap-1" role="group" aria-label="Playback speed">
          {SPEEDS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                const audio = audioRef.current;
                setSpeed(option);
                if (audio) audio.playbackRate = option;
              }}
              aria-pressed={speed === option}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                speed === option
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {option}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
