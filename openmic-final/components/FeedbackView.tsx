import React, { useState } from 'react';
import { AIFeedback } from '../types';
import { generateSpeech, getPowerWordsAndRephrases } from '../services/geminiService';
import {
  Lightbulb,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Play,
  Pause,
  Quote,
  Zap,
  Volume2,
  Loader2
} from 'lucide-react';

interface FeedbackViewProps {
  feedback: AIFeedback;
  transcript: string;
  confidence: number;
  audioUrl?: string;
  onReset: () => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({
  feedback,
  transcript,
  confidence,
  audioUrl,
  onReset
}) => {
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [isPlayingAI, setIsPlayingAI] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [powerWords, setPowerWords] = useState<string[] | null>(null);
  const [rephrases, setRephrases] = useState<string[] | null>(null);
  const [isLoadingPower, setIsLoadingPower] = useState(false);

  const audioRefUser = React.useRef<HTMLAudioElement | null>(null);

  const isFail =
    feedback.status === 'empty' || feedback.status === 'too_short';

  const toggleUserPlayback = () => {
    if (!audioRefUser.current) return;
    isPlayingUser
      ? audioRefUser.current.pause()
      : audioRefUser.current.play();
  };

  const speakFeedback = async () => {
    if (isPlayingAI) {
      setIsPlayingAI(false);
      return;
    }

    setIsGeneratingSpeech(true);
    const audioData = await generateSpeech(feedback.encouragement);
    setIsGeneratingSpeech(false);

    if (!audioData) return;

    try {
      setIsPlayingAI(true);
      const ctx = new AudioContext({ sampleRate: 24000 });
      const bytes = Uint8Array.from(atob(audioData), c =>
        c.charCodeAt(0)
      );
      const pcm = new Int16Array(bytes.buffer);

      const buffer = ctx.createBuffer(1, pcm.length, 24000);
      const channel = buffer.getChannelData(0);
      pcm.forEach((v, i) => (channel[i] = v / 32768));

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      src.onended = () => setIsPlayingAI(false);
      src.start();
    } catch {
      setIsPlayingAI(false);
    }
  };

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (feedback.status !== 'success' || !transcript) return;
      setIsLoadingPower(true);
      try {
        const res = await getPowerWordsAndRephrases(transcript);
        if (!mounted) return;
        setPowerWords(res.powerWords);
        setRephrases(res.rephrases);
      } catch (err) {
        console.error('Power words fetch failed', err);
        if (mounted) {
          setPowerWords(null);
          setRephrases(null);
        }
      } finally {
        if (mounted) setIsLoadingPower(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [feedback.status, transcript]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div
        className={`rounded-3xl p-8 text-white shadow-xl ${
          isFail
            ? 'bg-gradient-to-br from-rose-500 to-orange-500'
            : 'bg-gradient-to-br from-cyan-600 to-violet-700'
        }`}
      >
        <div className="text-center">
          <Zap className="mx-auto mb-4" size={40} />
          <h3 className="text-3xl font-black">
            {isFail ? 'Try Again!' : 'Awesome Effort!'}
          </h3>
          <p className="mt-2 font-bold opacity-80">
            Confidence Score: {confidence}%
          </p>

          <p className="mt-4">{feedback.encouragement}</p>

          {!isFail && (
            <button
              onClick={speakFeedback}
              disabled={isGeneratingSpeech}
              className="mt-4 px-6 py-2 bg-white/20 rounded-full font-bold"
            >
              {isGeneratingSpeech ? (
                <Loader2 className="animate-spin" />
              ) : isPlayingAI ? (
                <Pause />
              ) : (
                <Volume2 />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Transcript */}
      {!isFail && (
        <div className="bg-slate-900 rounded-2xl p-6">
          <div className="flex justify-between mb-4">
            <h4 className="flex items-center gap-2">
              <Quote size={18} /> What I heard
            </h4>

            {audioUrl && (
              <button onClick={toggleUserPlayback}>
                {isPlayingUser ? <Pause /> : <Play />}
              </button>
            )}
          </div>

          <audio
            ref={audioRefUser}
            src={audioUrl}
            onPlay={() => setIsPlayingUser(true)}
            onPause={() => setIsPlayingUser(false)}
            hidden
          />

          <p className="italic">"{transcript}"</p>
        </div>
      )}

      {/* SUCCESS ONLY */}
      {feedback.status === 'success' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Rephrases */}
          <div className="bg-slate-900 rounded-3xl p-6">
              <h4 className="flex items-center gap-2 mb-4">
                <Lightbulb /> 2 Ways to Rephrase
              </h4>

              {isLoadingPower ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" /> Generating...
                </div>
              ) : (
                (rephrases && rephrases.length > 0 ? rephrases : feedback.alternatives ?? [])
                  .map((alt, i) => (
                    <div key={i} className="flex gap-2 mb-3">
                      <CheckCircle2 />
                      <span>{alt}</span>
                    </div>
                  ))
              )}
          </div>

          {/* Vocabulary */}
          <div className="bg-slate-900 rounded-3xl p-6">
            <h4 className="flex items-center gap-2 mb-4">
              <BookOpen /> 2 Power Words
            </h4>

            {isLoadingPower ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" /> Generating...
              </div>
            ) : (
              (powerWords && powerWords.length > 0 ? powerWords : (feedback.vocabulary ?? []).map(v => v.word))
                .map((w, i) => (
                  <div key={i} className="mb-4">
                    <strong>{w}</strong>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full py-4 bg-white text-black rounded-xl font-black"
      >
        <RefreshCw /> {isFail ? 'Try Again' : 'Next Practice'}
      </button>
    </div>
  );
};

export default FeedbackView;
