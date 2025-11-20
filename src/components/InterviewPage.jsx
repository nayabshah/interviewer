import React, { useState, useEffect } from "react";
import { generateQuestion } from "../services/aiQuestionService";
import VideoRecorder from "./VideoRecorder";

const TOTAL_QUESTIONS = 5;

export default function InterviewPage({ onFinish }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [question, setQuestion] = useState("");
  const [qaList, setQaList] = useState([]);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    generateQuestion(currentQ).then((q) => {
      setQuestion(q);
      speakQuestion(q);
    });
  }, [currentQ]);

  function speakQuestion(q) {
    if ("speechSynthesis" in window) {
      const u = new window.SpeechSynthesisUtterance(q);
      u.lang = "en-US";
      window.speechSynthesis.speak(u);
    }
  }

  const handleRecorded = (blob) => {
    setRecordedBlob(blob);
  };

  const handleNext = () => {
    setQaList((prev) => [...prev, { question, videoBlob: recordedBlob }]);
    setRecordedBlob(null);
    if (currentQ + 1 < TOTAL_QUESTIONS) {
      setCurrentQ((c) => c + 1);
    } else {
      onFinish([...qaList, { question, videoBlob: recordedBlob }]);
    }
  };

  return (
    <div>
      <h2>
        Interview: Question {currentQ + 1} of {TOTAL_QUESTIONS}
      </h2>
      <div className="question-box">{question}</div>
      <VideoRecorder
        onRecorded={handleRecorded}
        recording={recording}
        setRecording={setRecording}
        key={currentQ}
      />
      <div>
        <button onClick={handleNext} disabled={!recordedBlob}>
          {currentQ + 1 < TOTAL_QUESTIONS
            ? "Next Question"
            : "Finish Interview"}
        </button>
      </div>
      <div style={{ marginTop: 30, fontSize: 14, color: "#444" }}>
        {recordedBlob
          ? "Recorded! You can proceed."
          : "Record your answer to continue."}
      </div>
    </div>
  );
}
