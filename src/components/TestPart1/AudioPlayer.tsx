import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioSrc: string;
  audioRef?: React.RefObject<HTMLAudioElement>;
  forceStop?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, audioRef, forceStop = false }) => {
  const internalRef = useRef<HTMLAudioElement>(null);
  const ref = audioRef ?? internalRef;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const logAudioState = (action: string, additionalInfo?: any) => {
    const audio = ref.current;
    if (!audio) return;

    console.group(`🎵 AudioPlayer - ${action}`);
    console.log('📍 Audio URL:', audioSrc);
    console.log('📊 Network State:', {
      0: 'NETWORK_EMPTY',
      1: 'NETWORK_IDLE', 
      2: 'NETWORK_LOADING',
      3: 'NETWORK_NO_SOURCE'
    }[audio.networkState] || audio.networkState);
    console.log('📈 Ready State:', {
      0: 'HAVE_NOTHING',
      1: 'HAVE_METADATA',
      2: 'HAVE_CURRENT_DATA',
      3: 'HAVE_FUTURE_DATA',
      4: 'HAVE_ENOUGH_DATA'
    }[audio.readyState] || audio.readyState);
    console.log('⏯️  Paused:', audio.paused);
    console.log('🔄 Loading State:', loadingState);
    console.log('🎛️  Audio Properties:', {
      currentTime: audio.currentTime,
      duration: audio.duration,
      volume: audio.volume,
      playbackRate: audio.playbackRate,
      muted: audio.muted,
      preload: audio.preload
    });
    if (additionalInfo) {
      console.log('ℹ️  Additional Info:', additionalInfo);
    }
    if (audio.error) {
      console.error('❌ Audio Error:', {
        code: audio.error.code,
        message: audio.error.message,
        errorTypes: {
          1: 'MEDIA_ERR_ABORTED',
          2: 'MEDIA_ERR_NETWORK', 
          3: 'MEDIA_ERR_DECODE',
          4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
        }[audio.error.code] || 'UNKNOWN_ERROR'
      });
    }
    console.groupEnd();
  };

  const handlePlayPause = () => {
    if (ref.current) {
      if (isPlaying) {
        console.log('⏸️  Pausing audio');
        ref.current.pause();
      } else {
        console.log('▶️  Attempting to play audio');
        logAudioState('Before Play');
        
        const playPromise = ref.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅ Play successful');
              logAudioState('Play Success');
            })
            .catch((error) => {
              console.error('❌ Play failed:', error);
              logAudioState('Play Failed', { error: error.message });
            });
        }
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (ref.current) {
      ref.current.currentTime = newTime;
      logAudioState('Seek', { newTime });
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

    const updateDuration = () => {
      console.log('📏 Duration loaded:', audio.duration);
      setDuration(audio.duration);
    };

    const handlePlay = () => {
      console.log('▶️  Audio started playing');
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log('⏸️  Audio paused');
      setIsPlaying(false);
    };

    const handleEnded = () => {
      console.log('🏁 Audio ended');
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      console.log('🔄 Audio load started');
      setLoadingState('loading');
    };

    const handleLoadedMetadata = () => {
      console.log('📊 Audio metadata loaded');
      setLoadingState('loaded');
      logAudioState('Metadata Loaded');
    };

    const handleCanPlay = () => {
      console.log('✅ Audio can play');
    };

    const handleCanPlayThrough = () => {
      console.log('🚀 Audio can play through');
    };

    const handleWaiting = () => {
      console.log('⏳ Audio waiting for data');
    };

    const handleStalled = () => {
      console.log('🛑 Audio stalled');
    };

    const handleSuspend = () => {
      console.log('⏸️  Audio suspended');
    };

    // Thêm tất cả event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('suspend', handleSuspend);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('suspend', handleSuspend);
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isDragging]);

  useEffect(() => {
    if (ref.current) {
      console.log('🔄 Audio source changed to:', audioSrc);
      setLoadingState('idle');
      ref.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
      logAudioState('Source Changed');
    }
  }, [audioSrc]);

  // Force stop audio when forceStop prop changes
  useEffect(() => {
    if (forceStop && ref.current) {
      console.log('🛑 Force stopping audio');
      ref.current.pause();
      ref.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [forceStop]);

  // Enhanced error handling và Safari compatibility
  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;

    // Kiểm tra URL trước khi load
    console.log('🔍 Checking audio URL:', audioSrc);
    console.log('🌐 URL validity:', {
      isValid: audioSrc && audioSrc.length > 0,
      isHttps: audioSrc?.startsWith('https://'),
      extension: audioSrc?.split('.').pop()?.toLowerCase(),
      fullUrl: audioSrc
    });

    // Thiết lập audio element
    audio.preload = 'metadata';
    audio.muted = false;
    
    // Enhanced error handling
    const handleError = (e: Event) => {
      console.error('❌ Audio loading error occurred:');
      setLoadingState('error');
      logAudioState('Error Occurred', { 
        eventType: e.type,
        timestamp: new Date().toISOString()
      });
      
      // Kiểm tra network connectivity
      if (navigator.onLine) {
        console.log('🌐 Network is online');
        // Test URL accessibility
        fetch(audioSrc, { method: 'HEAD' })
          .then(response => {
            console.log('🔍 URL accessibility test:', {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries())
            });
          })
          .catch(fetchError => {
            console.error('❌ URL accessibility test failed:', fetchError);
          });
      } else {
        console.warn('🔌 Network is offline');
      }
    };

    // Network state change handler
    const handleNetworkStateChange = () => {
      logAudioState('Network State Changed');
    };

    // Progress handler
    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const duration = audio.duration;
        if (duration > 0) {
          console.log('📈 Buffer progress:', `${((bufferedEnd / duration) * 100).toFixed(1)}%`);
        }
      }
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('networkstatechange', handleNetworkStateChange);
    audio.addEventListener('progress', handleProgress);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('networkstatechange', handleNetworkStateChange);
      audio.removeEventListener('progress', handleProgress);
    };
  }, [audioSrc]);

  if (!audioSrc) {
    console.warn('⚠️  No audio source provided');
    return null;
  }

  return (
    <div className="w-full mx-auto mb-4">
      <audio 
        ref={ref} 
        src={audioSrc} 
        preload="metadata" 
        className="hidden"
        playsInline
        webkit-playsinline="true"
      />
      
      {/* Debug info */}
      <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
        <div className="flex justify-between items-center">
          <span>Loading: {loadingState}</span>
          <span>URL: {audioSrc?.substring(0, 50)}...</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-4">
          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            disabled={loadingState === 'error'}
            className={`p-2 rounded-full transition ${
              loadingState === 'error' 
                ? 'bg-red-500 text-white cursor-not-allowed' 
                : 'bg-black hover:bg-neutral-800 text-white'
            }`}
          >
            {loadingState === 'error' ? '❌' : (isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />)}
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
              disabled={loadingState === 'error'}
              className="w-full h-2 bg-neutral-300 rounded-full appearance-none cursor-pointer transition-all duration-200
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black
                [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-black disabled:opacity-50"
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
              disabled={loadingState === 'error'}
              className="bg-neutral-200 text-black rounded-lg px-2 py-1 text-sm focus:outline-none cursor-pointer disabled:opacity-50"
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