import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioSrc: string;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, audioRef }) => {
  const internalRef = useRef<HTMLAudioElement>(null);
  const ref = audioRef ?? internalRef;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (ref.current) {
      isPlaying ? ref.current.pause() : ref.current.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (ref.current) {
      ref.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (ref.current) {
      ref.current.volume = newVolume;
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRate = parseFloat(e.target.value);
    setPlaybackRate(newRate);
    if (ref.current) {
      ref.current.playbackRate = newRate;
    }
  };

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;

    const updateTime = () => {
      if (!isDragging) setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isDragging]);

  useEffect(() => {
    if (ref.current) ref.current.load();
  }, [audioSrc]);

  if (!audioSrc) return null;

  return (
    <div className="w-full mx-auto mb-4">
      <audio ref={ref} src={audioSrc} preload="metadata" className="hidden" />
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-4">
          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-full bg-black hover:bg-neutral-800 text-white transition"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Progress Bar */}
          <div className="flex-1 mx-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              className="w-full h-2 bg-neutral-300 rounded-full appearance-none cursor-pointer transition-all duration-200
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black
                [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-black"
              style={{
                background: `linear-gradient(to right, black 0%, black ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>

          {/* Time */}
          <div className="text-sm text-neutral-600 min-w-0">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-neutral-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-neutral-300 rounded-full appearance-none cursor-pointer transition-all duration-200
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black
                [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-black"
              style={{
                background: `linear-gradient(to right, black 0%, black ${volume * 100}%, #d4d4d4 ${volume * 100}%, #d4d4d4 100%)`
              }}
            />
          </div>

          {/* Playback Rate */}
          <div className="relative">
            <select
              value={playbackRate}
              onChange={handleSpeedChange}
              className="bg-neutral-200 text-black rounded-lg px-2 py-1 text-sm focus:outline-none cursor-pointer"
            >
              <option value="0.5">0.5×</option>
              <option value="0.75">0.75×</option>
              <option value="1">1×</option>
              <option value="1.25">1.25×</option>
              <option value="1.5">1.5×</option>
              <option value="2">2×</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
