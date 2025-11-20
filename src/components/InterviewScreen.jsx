import React, { useEffect, useState, useRef, useCallback } from "react";
import { useGeminiLive } from "../services/geminiLive";
import OrbVisualizer from "./OrbVisualizer";
import { Mic, MicOff, PhoneOff, Activity } from "lucide-react";

const InterviewScreen = ({ config, onEnd }) => {
  const [status, setStatus] = useState("connecting");
  const [transcript, setTranscript] = useState([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);

  const scrollRef = useRef(null);
  const hasConnected = useRef(false);

  // Define callbacks with useCallback to avoid unnecessary re-renders/ref updates in the hook
  const handleTranscript = useCallback((text, isUser, isFinal) => {
    setTranscript((prev) => {
      // If we receive a final signal with empty text, mark the last message of that role as final
      if (isFinal && !text) {
        // Polyfill for findLastIndex for older environments
        let lastIdx = -1;
        const targetRole = isUser ? "user" : "model";
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].role === targetRole) {
            lastIdx = i;
            break;
          }
        }

        if (lastIdx !== -1) {
          const newTranscript = [...prev];
          newTranscript[lastIdx] = { ...newTranscript[lastIdx], isFinal: true };
          return newTranscript;
        }
        return prev;
      }

      const last = prev[prev.length - 1];
      // Append to last message if roles match and it's not final yet
      if (last && last.role === (isUser ? "user" : "model") && !last.isFinal) {
        const updatedLast = { ...last, text: last.text + text };
        return [...prev.slice(0, -1), updatedLast];
      } else {
        // New message.
        // Allow strings that are just whitespace (e.g. " ") as they might be start of sentences or separators
        if (text === null || text === undefined || text === "") return prev;

        return [
          ...prev,
          {
            id: Date.now().toString(),
            role: isUser ? "user" : "model",
            text: text,
            timestamp: new Date(),
            isFinal: false, // Default to false until turn completes
          },
        ];
      }
    });
  }, []);

  const handleAudioLevel = useCallback((level) => {
    setAudioLevel((prev) => prev * 0.8 + level * 0.2);
  }, []);

  const handleError = useCallback((err) => {
    console.error("Interview Error:", err);
  }, []);

  const { connect, disconnect } = useGeminiLive({
    onStatusChange: setStatus,
    onTranscript: handleTranscript,
    onAudioLevel: handleAudioLevel,
    onError: handleError,
    muted: isMicMuted,
  });

  useEffect(() => {
    if (!hasConnected.current) {
      hasConnected.current = true;
      connect(config);
    }

    return () => {
      disconnect();
      hasConnected.current = false;
    };
  }, [connect, disconnect, config]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleDisconnect = async () => {
    await disconnect();
    onEnd();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="flex items-center gap-3">
          <Activity
            className={`w-5 h-5 ${
              status === "connected" ? "text-green-400" : "text-yellow-400"
            }`}
          />
          <span className="font-semibold text-slate-200">
            {config.title} Interview
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {status}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <PhoneOff className="w-4 h-4" />
          End Call
        </button>
      </header>

      <main className="flex-1 pt-16 flex flex-col md:flex-row">
        {/* Visualizer Area */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] md:h-[calc(100vh-64px)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-slate-950 z-0 pointer-events-none" />

          <div className="z-10 flex flex-col items-center gap-8">
            <OrbVisualizer
              isActive={status === "connected"}
              audioLevel={isMicMuted ? 0 : audioLevel}
            />

            <div className="text-center space-y-2 max-w-md px-4">
              <h2 className="text-xl font-medium text-slate-200">
                {status === "connecting"
                  ? "Establishing Connection..."
                  : status === "connected"
                  ? "AI Interviewer is Active"
                  : status === "error"
                  ? "Connection Error"
                  : "Disconnected"}
              </h2>
              <p className="text-slate-400 text-sm">
                {status === "connected"
                  ? "Speak clearly. The AI is listening and will respond naturally."
                  : status === "error"
                  ? "Please check your microphone permissions or try again."
                  : "Please wait while we connect to the Gemini Live API."}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 z-20 flex gap-4">
            <button
              className={`p-4 rounded-full transition-all ${
                isMicMuted
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
              onClick={() => setIsMicMuted(!isMicMuted)}
            >
              {isMicMuted ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Transcript Sidebar */}
        <div className="w-full md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-[400px] md:h-[calc(100vh-64px)]">
          <div className="p-4 border-b border-slate-800 font-medium text-slate-400 text-sm uppercase tracking-wider flex justify-between items-center">
            <span>Live Transcript</span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500">
              Preview
            </span>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
            {transcript.length === 0 && (
              <div className="text-slate-600 text-center italic mt-10 text-sm">
                Waiting for conversation to start...
              </div>
            )}
            {transcript.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`flex flex-col ${
                  item.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <span className="text-[10px] text-slate-500 mb-1 uppercase tracking-wide font-semibold">
                  {item.role === "user" ? "Candidate" : "Interviewer"}
                </span>
                <div
                  className={`max-w-[90%] p-3 rounded-xl text-sm leading-relaxed shadow-sm ${
                    item.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewScreen;
