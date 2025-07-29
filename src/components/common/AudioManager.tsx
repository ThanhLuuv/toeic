import { useRef, useEffect, useState } from 'react';

export const useAudioManager = (soundEnabled: boolean) => {
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const errorAudio = useRef<HTMLAudioElement | null>(null);
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const currentSpeech = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);

  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContext.current) {
      try {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('Audio context initialized');
      } catch (error) {
        console.log('Failed to initialize audio context:', error);
      }
    }
  };

  // Resume audio context if suspended
  const resumeAudioContext = async () => {
    if (audioContext.current && audioContext.current.state === 'suspended') {
      try {
        await audioContext.current.resume();
        console.log('Audio context resumed');
      } catch (error) {
        console.log('Failed to resume audio context:', error);
      }
    }
  };

  useEffect(() => {
    console.log('Initializing audio manager...');
    
    // Initialize audio context immediately
    initAudioContext();
    
    // Add user interaction handler to resume audio context
    const handleUserInteraction = async () => {
      await resumeAudioContext();
      // Remove the event listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
    
    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    
    // Initialize audio elements with error handling
    const initAudioElements = async () => {
      try {
        const successUrl = `${process.env.PUBLIC_URL}/asset/audio/success-sound.mp3`;
        const errorUrl = `${process.env.PUBLIC_URL}/asset/audio/error-sound.mp3`;
        console.log('Success audio URL:', successUrl);
        console.log('Error audio URL:', errorUrl);
        
        // Create success audio
        successAudio.current = new Audio(successUrl);
        successAudio.current.preload = 'auto';
        successAudio.current.addEventListener('loadstart', () => console.log('Success audio loadstart'));
        successAudio.current.addEventListener('canplay', () => {
          console.log('Success audio canplay');
          setIsAudioReady(true);
        });
        successAudio.current.addEventListener('error', (e) => {
          console.log('Error loading success sound:', e);
          successAudio.current = null;
        });
        
        // Create error audio
        errorAudio.current = new Audio(errorUrl);
        errorAudio.current.preload = 'auto';
        errorAudio.current.addEventListener('loadstart', () => console.log('Error audio loadstart'));
        errorAudio.current.addEventListener('canplay', () => {
          console.log('Error audio canplay');
          setIsAudioReady(true);
        });
        errorAudio.current.addEventListener('error', (e) => {
          console.log('Error loading error sound:', e);
          errorAudio.current = null;
        });

        // Resume audio context after user interaction
        await resumeAudioContext();
        
      } catch (error) {
        console.log('Error initializing audio:', error);
      }
    };
    
    initAudioElements();
    
    // Cleanup function to stop audio when component unmounts
    return () => {
      stopCurrentAudio();
      if (audioContext.current) {
        audioContext.current.close();
        audioContext.current = null;
      }
      // Remove event listeners
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const stopCurrentAudio = () => {
    // Stop current audio if playing
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
      currentAudio.current = null;
    }
    
    // Stop current speech synthesis if speaking
    if (currentSpeech.current) {
      window.speechSynthesis.cancel();
      currentSpeech.current = null;
    }
  };

  const playSuccessSound = async () => {
    console.log('playSuccessSound called, soundEnabled:', soundEnabled);
    if (!soundEnabled) {
      console.log('Sound disabled, returning');
      return;
    }
    
    // Ensure audio context is ready
    await resumeAudioContext();
    
    // Try multiple approaches to play sound
    const playSound = async () => {
      try {
        // Approach 1: Use cached audio
        if (successAudio.current && successAudio.current.readyState >= 2) {
          console.log('Using cached success audio');
          successAudio.current.currentTime = 0;
          await successAudio.current.play();
          console.log('Success sound playing...');
          return;
        }
      } catch (e) {
        console.log('Cached audio failed:', e);
      }
      
      try {
        // Approach 2: Create new audio instance
        console.log('Creating new success audio instance');
        const audio = new Audio(`${process.env.PUBLIC_URL}/asset/audio/success-sound.mp3`);
        await audio.play();
        console.log('New success audio playing...');
        return;
      } catch (e) {
        console.log('New audio failed:', e);
      }
      
      try {
        // Approach 3: Use Web Audio API
        console.log('Trying Web Audio API');
        if (!audioContext.current) {
          initAudioContext();
        }
        if (audioContext.current) {
          const response = await fetch(`${process.env.PUBLIC_URL}/asset/audio/success-sound.mp3`);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
          const source = audioContext.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.current.destination);
          source.start(0);
          console.log('Web Audio API success sound playing...');
          return;
        }
      } catch (e) {
        console.log('Web Audio API failed:', e);
      }
      
      console.log('All audio methods failed');
    };
    
    playSound();
  };

  const playErrorSound = async () => {
    console.log('playErrorSound called, soundEnabled:', soundEnabled);
    if (!soundEnabled) {
      console.log('Sound disabled, returning');
      return;
    }
    
    // Ensure audio context is ready
    await resumeAudioContext();
    
    // Try multiple approaches to play sound
    const playSound = async () => {
      try {
        // Approach 1: Use cached audio
        if (errorAudio.current && errorAudio.current.readyState >= 2) {
          console.log('Using cached error audio');
          errorAudio.current.currentTime = 0;
          await errorAudio.current.play();
          console.log('Error sound playing...');
          return;
        }
      } catch (e) {
        console.log('Cached audio failed:', e);
      }
      
      try {
        // Approach 2: Create new audio instance
        console.log('Creating new error audio instance');
        const audio = new Audio(`${process.env.PUBLIC_URL}/asset/audio/error-sound.mp3`);
        await audio.play();
        console.log('New error audio playing...');
        return;
      } catch (e) {
        console.log('New audio failed:', e);
      }
      
      try {
        // Approach 3: Use Web Audio API
        console.log('Trying Web Audio API for error sound');
        if (!audioContext.current) {
          initAudioContext();
        }
        if (audioContext.current) {
          const response = await fetch(`${process.env.PUBLIC_URL}/asset/audio/error-sound.mp3`);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
          const source = audioContext.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.current.destination);
          source.start(0);
          console.log('Web Audio API error sound playing...');
          return;
        }
      } catch (e) {
        console.log('Web Audio API failed:', e);
      }
      
      console.log('All audio methods failed');
    };
    
    playSound();
  };

  const handlePlayAudio = async (audioUrl?: string, text?: string) => {
    // Stop any currently playing audio first
    stopCurrentAudio();
    
    // Ensure audio context is ready
    await resumeAudioContext();
    
    if (audioUrl) {
      try {
        // Create new audio instance with better error handling
        const audio = new Audio();
        currentAudio.current = audio;
        
        // Add event listeners to clean up when audio finishes
        audio.addEventListener('ended', () => {
          currentAudio.current = null;
        });
        
        audio.addEventListener('error', (e) => {
          console.log('Error playing audio:', e);
          currentAudio.current = null;
        });
        
        // Set audio source and play
        audio.src = audioUrl;
        audio.preload = 'auto';
        
        // Add cross-origin attribute for external URLs
        if (audioUrl.includes('cloudinary.com') || audioUrl.includes('http')) {
          audio.crossOrigin = 'anonymous';
        }
        
        // Wait for audio to be ready before playing
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Audio loading timeout'));
          }, 10000); // 10 second timeout
          
          audio.addEventListener('canplay', () => {
            clearTimeout(timeout);
            resolve(true);
          }, { once: true });
          
          audio.addEventListener('error', (e) => {
            clearTimeout(timeout);
            reject(e);
          }, { once: true });
          
          audio.load();
        });
        
        await audio.play();
        console.log('Audio playing successfully');
        
      } catch (e) {
        console.log('Error playing audio:', e);
        currentAudio.current = null;
        
        // Fallback: try with different approach
        try {
          console.log('Trying fallback audio method...');
          const fallbackAudio = new Audio();
          fallbackAudio.crossOrigin = 'anonymous';
          fallbackAudio.src = audioUrl;
          
          // Try to play immediately without waiting
          await fallbackAudio.play();
          console.log('Fallback audio playing successfully');
        } catch (fallbackError) {
          console.log('Fallback audio also failed:', fallbackError);
          
          // Final fallback: try with Web Audio API
          try {
            console.log('Trying Web Audio API fallback...');
            if (!audioContext.current) {
              initAudioContext();
            }
            if (audioContext.current) {
              const response = await fetch(audioUrl, {
                mode: 'cors',
                headers: {
                  'Accept': 'audio/*'
                }
              });
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
              const arrayBuffer = await response.arrayBuffer();
              const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
              const source = audioContext.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContext.current.destination);
              source.start(0);
              console.log('Web Audio API fallback playing successfully');
            }
          } catch (webAudioError) {
            console.log('Web Audio API fallback also failed:', webAudioError);
          }
        }
      }
    } else if (text) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      currentSpeech.current = utterance;
      
      // Add event listeners to clean up when speech finishes
      utterance.addEventListener('end', () => {
        currentSpeech.current = null;
      });
      
      utterance.addEventListener('error', () => {
        currentSpeech.current = null;
      });
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return {
    playSuccessSound,
    playErrorSound,
    handlePlayAudio,
    stopCurrentAudio,
    isAudioReady
  };
}; 