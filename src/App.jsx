import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import InterviewPage from "./components/InterviewPage";
import ReviewPage from "./components/ReviewPage";

export default function App() {
  const [step, setStep] = useState("landing");
  const [answers, setAnswers] = useState([]); // Array of {question, videoBlob}
  const [interviewData, setInterviewData] = useState([]); // track Q/A while interviewing

  const handleInterviewFinish = (qa) => {
    setAnswers(qa);
    setStep("review");
  };

  return (
    <div className="app-container">
      {step === "landing" && (
        <LandingPage onStart={() => setStep("interview")} />
      )}
      {step === "interview" && (
        <InterviewPage onFinish={handleInterviewFinish} />
      )}
      {step === "review" && (
        <ReviewPage
          answers={answers}
          onRestart={() => {
            setStep("landing");
            setAnswers([]);
          }}
        />
      )}
    </div>
  );
}
