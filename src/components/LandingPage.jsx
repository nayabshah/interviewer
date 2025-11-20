import React from "react";

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
        <h1 className="text-3xl font-bold mb-4 text-slate-100">
          Welcome to AI Interviewer
        </h1>
        <p className="text-slate-300 mb-6">
          This app will ask you interview questions tailored to your role.
          Answer each question by video. You'll get live coaching tips and can
          review your performance at the end.
        </p>
        <ol className="list-decimal list-inside mb-8 text-slate-400 space-y-1">
          <li>Complete the setup to specify your target job and skills.</li>
          <li>Allow camera and microphone access when prompted.</li>
          <li>
            Answer each question; watch for AI feedback during the interview.
          </li>
        </ol>
        <button
          onClick={onStart}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition"
        >
          Start
        </button>
      </div>
    </div>
  );
}
