import React, { useState, useMemo } from "react";
import { LEVELS } from "./constants";
import { useProgress } from "./hooks/useProgress";
import { getAIFeedback } from "./services/geminiService";
import { SpeakingPrompt, AIFeedback } from "./types";
import Recorder from "./components/Recorder";
import FeedbackView from "./components/FeedbackView";
import Stats from "./components/Stats";
import LandingPage from "./components/LandingPage";
import {
  ChevronRight,
  Mic2,
  LayoutDashboard,
  Compass,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";

const App: React.FC = () => {
  const { progress, addSession } = useProgress();
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<SpeakingPrompt | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<AIFeedback | null>(
    null
  );
  const [sessionData, setSessionData] = useState<{
    transcript: string;
    confidence: number;
    audioUrl?: string;
  } | null>(null);
  const [view, setView] = useState<"landing" | "practice" | "dashboard">(
    "landing"
  );

  const currentLevelId = selectedLevelId || progress.currentLevelId;

  const currentLevel = useMemo(() => {
    return LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];
  }, [currentLevelId]);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleTranscriptionComplete = async (
    text: string,
    duration: number,
    audioBlob?: Blob
  ) => {
    if (!activePrompt || !audioBlob) return;
    setIsProcessing(true);

    try {
      const audioBase64 = await blobToBase64(audioBlob);

      const feedback = await getAIFeedback(
        audioBase64,
        activePrompt.text,
        text
      );

      let confidence = 0;
      if (feedback.status === "success") {
        confidence = Math.min(
          100,
          40 + Math.floor(Math.random() * 50) + Math.min(10, duration)
        );

        const audioUrl = URL.createObjectURL(audioBlob);
        const finalTranscript =
          text || (feedback as any).transcript || "Audio processed";

        setSessionData({
          transcript: finalTranscript,
          confidence,
          audioUrl,
        });

        addSession(
          {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            prompt: activePrompt.text,
            transcript: finalTranscript,
            duration,
            confidence,
            feedback,
            audioUrl,
          },
          activePrompt.id
        );
      }

      setCurrentFeedback(feedback);
    } catch (err) {
      console.error("Processing failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLevelChange = (id: string) => {
    setSelectedLevelId(id);
    setActivePrompt(null);
    setCurrentFeedback(null);
  };

  const handleReset = () => {
    if (sessionData?.audioUrl) URL.revokeObjectURL(sessionData.audioUrl);
    setCurrentFeedback(null);
    setSessionData(null);
    setActivePrompt(null);
  };

  if (view === "landing") {
    return <LandingPage onStart={() => setView("practice")} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-20 font-sans">
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b-4 border-slate-900">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-violet-600 rounded-xl flex items-center justify-center cursor-pointer"
              onClick={() => setView("landing")}
            >
              <Mic2 className="w-6 h-6 text-white" />
            </div>
            <h1
              className="text-2xl font-black cursor-pointer"
              onClick={() => setView("landing")}
            >
              OpenMic
            </h1>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-800 rounded-2xl">
            <button
              onClick={() => setView("practice")}
              className={`px-6 py-2.5 rounded-xl font-black ${
                view === "practice"
                  ? "bg-slate-700 text-cyan-400"
                  : "text-slate-400"
              }`}
            >
              <Compass size={18} /> Quests
            </button>
            <button
              onClick={() => setView("dashboard")}
              className={`px-6 py-2.5 rounded-xl font-black ${
                view === "dashboard"
                  ? "bg-slate-700 text-cyan-400"
                  : "text-slate-400"
              }`}
            >
              <LayoutDashboard size={18} /> Stats
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-10">
        {view === "dashboard" ? (
          <Stats progress={progress} />
        ) : (
          <div className="flex flex-col items-center">
            {currentFeedback && sessionData ? (
              <FeedbackView
                feedback={currentFeedback}
                transcript={sessionData.transcript}
                confidence={sessionData.confidence}
                audioUrl={sessionData.audioUrl}
                onReset={handleReset}
              />
            ) : activePrompt ? (
              <Recorder
                isProcessing={isProcessing}
                onTranscriptionComplete={handleTranscriptionComplete}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentLevel.prompts.map((prompt) => {
                  const isCompleted =
                    progress.completedPromptIds.includes(prompt.id);

                  return (
                    <button
                      key={prompt.id}
                      onClick={() => setActivePrompt(prompt)}
                      className="p-6 bg-slate-900 rounded-2xl text-left"
                    >
                      <div className="flex justify-between mb-4">
                        <span className="text-xs uppercase">
                          {prompt.category}
                        </span>
                        {isCompleted && (
                          <CheckCircle2 className="text-emerald-400" />
                        )}
                      </div>
                      <p className="font-black">{prompt.text}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
