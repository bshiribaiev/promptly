import { useRef, useState, useCallback } from 'react';

interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: Error) => void;
  wsUrl?: string;
}

export function useVoiceInput({
  onTranscript,
  onError,
  wsUrl = 'ws://127.0.0.1:8081/ws/stt',
}: UseVoiceInputOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create WebSocket connection
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        const text = event.data;
        console.log('WebSocket received message:', text);
        // Ignore the "ready" confirmation message
        if (text === 'ready') {
          console.log('WebSocket ready to receive audio');
          return;
        }
        console.log('Received transcript:', text);
        console.log('About to call setTranscript and onTranscript callback');
        setTranscript(text);
        if (onTranscript) {
          console.log('Calling onTranscript callback with:', text);
          onTranscript(text);
        } else {
          console.warn('onTranscript callback is not defined!');
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        const error = new Error('WebSocket connection failed');
        onError?.(error);
        stopRecording();
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed', event.code, event.reason);
        wsRef.current = null;
        if (event.code !== 1000) {
          // Abnormal close
          const error = new Error(`WebSocket closed abnormally: ${event.code}`);
          onError?.(error);
        }
      };

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };

      mediaRecorder.start(500); // Send chunks every 500ms
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError?.(error as Error);
      stopRecording();
    }
  }, [wsUrl, onTranscript, onError]);

  const stopRecording = useCallback(() => {
    console.log('Stopping recording...');
    
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Send 'end' message to finalize transcription
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending end message to backend');
      wsRef.current.send('end');
    }

    // DON'T close the WebSocket here - let the backend close it after sending the transcript
    // The onclose handler will clean up when the backend closes the connection
    
    mediaRecorderRef.current = null;
    setIsRecording(false);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const reset = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    toggleRecording,
    reset,
  };
}

