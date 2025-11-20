import React, { useState } from "react";
import PreInterviewForm from "./components/PreInterviewForm";
import LandingPage from "./components/LandingPage";
import InterviewPage from "./components/InterviewPage";
import ReviewPage from "./components/ReviewPage";

export default function App() {
  const [step, setStep] = useState("landing");
  const [preInterview, setPreInterview] = useState(null);
  const [answers, setAnswers] = useState([]);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200">
      {step === "landing" && <LandingPage onStart={() => setStep("setup")} />}
      {step === "setup" && (
        <PreInterviewForm
          onSubmit={(data) => {
            setPreInterview(data);
            setStep("interview");
          }}
        />
      )}
      {step === "interview" && (
        <InterviewPage
          onFinish={setAnswers}
          preInterview={preInterview}
          onDone={() => setStep("review")}
        />
      )}
      {step === "review" && (
        <ReviewPage
          answers={answers}
          onRestart={() => {
            setStep("landing");
            setAnswers([]);
            setPreInterview(null);
          }}
        />
      )}
    </div>
  );
}
