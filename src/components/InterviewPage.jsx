import React, { useState, useEffect } from "react";
import { generateQuestion } from "../services/aiQuestionService";
import VideoRecorder from "./VideoRecorder";
import parseGeminiResponse from "../utils/parseGeminiResponse";

const TOTAL_QUESTIONS = 5;

export default function InterviewPage({ preInterview, onFinish, onDone }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [rawGemini, setRawGemini] = useState("");
  const [parsed, setParsed] = useState({
    question: "",
    sampleAnswer: "",
    tips: [],
  });
  const [qaList, setQaList] = useState([]);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (preInterview) {
      generateQuestion(currentQ, preInterview).then((response) => {
        setRawGemini(response);
        const gParsed = parseGeminiResponse(response);
        setParsed(gParsed);
        speakQuestion(gParsed.question);
        setLoading(false);
      });
    }
    // eslint-disable-next-line
  }, [currentQ, preInterview]);

  function speakQuestion(q) {
    if ("speechSynthesis" in window && q) {
      const u = new window.SpeechSynthesisUtterance(q);
      u.lang = "en-US";
      window.speechSynthesis.speak(u);
    }
  }

  const handleRecorded = (blob) => {
    setRecordedBlob(blob);
  };

  const handleNext = () => {
    setQaList((prev) => [...prev, { ...parsed, videoBlob: recordedBlob }]);
    setRecordedBlob(null);
    if (currentQ + 1 < TOTAL_QUESTIONS) {
      setCurrentQ((c) => c + 1);
    } else {
      onFinish([...qaList, { ...parsed, videoBlob: recordedBlob }]);
      if (onDone) onDone();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
        <h2 className="text-2xl font-bold mb-3 text-slate-100 text-center">
          Interview In Progress
        </h2>
        <ProgressBar total={TOTAL_QUESTIONS} current={currentQ} />

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="text-gray-400">Loading question…</span>
          </div>
        ) : (
          <div className="mb-7 bg-blue-50/5 border-l-4 border-blue-500 p-5 rounded-lg">
            <h3 className="text-lg font-bold mb-2 text-blue-100">
              {parsed.question}
            </h3>
            <ExpertSection
              sampleAnswer={parsed.sampleAnswer}
              tips={parsed.tips}
            />
          </div>
        )}

        <VideoRecorder
          onRecorded={handleRecorded}
          recording={recording}
          setRecording={setRecording}
          key={currentQ}
        />
        <div className="flex justify-end mt-6">
          <button
            className={`px-5 py-2 rounded-full font-semibold shadow transition 
              ${
                !recordedBlob || loading
                  ? "bg-gray-700 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            onClick={handleNext}
            disabled={!recordedBlob || loading}
          >
            {currentQ + 1 < TOTAL_QUESTIONS
              ? "Next Question"
              : "Finish Interview"}
          </button>
        </div>
        <div className="mt-3 text-sm text-slate-400 text-center">
          {recordedBlob
            ? "Recorded! You can proceed."
            : "Record your answer to continue."}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ total, current }) {
  return (
    <div className="flex gap-2 mb-6 justify-center">
      {Array.from({ length: total }).map((_, idx) => (
        <div
          key={idx}
          className={`h-3 w-10 rounded-full ${
            idx < current
              ? "bg-green-400"
              : idx === current
              ? "bg-blue-600"
              : "bg-gray-700"
          }`}
        />
      ))}
    </div>
  );
}

function ExpertSection({ sampleAnswer, tips }) {
  return (
    <div className="bg-yellow-100/10 border border-yellow-400/30 rounded-lg p-4">
      <div className="font-semibold mb-1 text-yellow-300">Sample Answer:</div>
      <div className="italic text-yellow-100 mb-3">{sampleAnswer}</div>
      <div className="font-semibold text-green-300">Expert Tips:</div>
      <ul className="list-disc ml-7 text-green-200 space-y-1">
        {tips.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
