
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, Sparkles, AlertCircle, Mic2 } from 'lucide-react';

interface RecorderProps {
  onTranscriptionComplete: (text: string, duration: number, audioBlob?: Blob) => void;
  isProcessing: boolean;
}

const Recorder: React.FC<RecorderProps> = ({ onTranscriptionComplete, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'no-speech') {
          setError("blue");
        }
        stopRecording();
      };
    }
  }, []);

  const startRecording = async () => {
    setError(null);
    setTranscript('');
    setDuration(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.start();
      
      setIsRecording(true);
      recognitionRef.current?.start();
      
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError("Microphone access denied or error occurred.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setTimeout(() => {
      const audioBlob = audioChunksRef.current.length > 0 
        ? new Blob(audioChunksRef.current, { type: 'audio/webm' }) 
        : undefined;
      onTranscriptionComplete(transcript.trim(), duration, audioBlob);
    }, 800);
  };

  return (
    <div className="flex flex-col items-center space-y-8 w-full p-10 bg-slate-900 rounded-[2.5rem] shadow-2xl border-b-8 border-slate-800 relative overflow-hidden">
      {/* Subtle background logo */}
      <Mic2 className="absolute -right-8 -top-8 w-32 h-32 text-slate-800/20 rotate-12" />
      
      <div className="text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2 opacity-30">
          <Mic2 size={14} className="text-cyan-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">OpenMic Live</span>
        </div>
        <h3 className="text-2xl font-black text-slate-50 mb-2">Speak Now</h3>
        <p className="text-slate-400 font-medium">Capture your voice for playback and feedback.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl text-sm font-bold border border-rose-500/20 relative z-10">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="relative z-10">
        {isRecording && (
          <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-20"></div>
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            isRecording 
              ? 'bg-rose-500 shadow-xl shadow-rose-500/20' 
              : 'bg-cyan-500 shadow-xl shadow-cyan-500/20'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed scale-90' : ''}`}
        >
          {isProcessing ? (
            <Loader2 className="w-12 h-12 text-slate-950 animate-spin" />
          ) : isRecording ? (
            <Square className="w-12 h-12 text-white" fill="white" />
          ) : (
            <Mic className="w-12 h-12 text-slate-950" />
          )}
        </button>
      </div>

      <div className="w-full flex flex-col items-center relative z-10">
        <div className="flex items-end gap-1 mb-4 h-8">
          {isRecording ? (
             [1,2,3,4,5,6,7,8].map(i => (
              <div 
                key={i} 
                className="w-2 bg-cyan-400 rounded-full animate-pulse" 
                style={{ 
                  height: `${20 + Math.random() * 80}%`,
                  animationDuration: `${0.5 + Math.random()}s`
                }}
              ></div>
             ))
          ) : (
            <div className="h-1 w-32 bg-slate-800 rounded-full"></div>
          )}
        </div>
        <span className="text-4xl font-black text-slate-50 tracking-tighter tabular-nums">
          {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
        </span>
      </div>

      {transcript && !isRecording && !isProcessing && (
        <div className="w-full p-6 bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700 italic text-slate-400 text-center text-sm leading-relaxed relative z-10">
          "{transcript}"
        </div>
      )}
    </div>
  );
};

export default Recorder;
