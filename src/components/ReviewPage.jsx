import React from "react";

export default function ReviewPage({ answers, onRestart }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-slate-100">
          Interview Review
        </h2>
        {answers.length === 0 && (
          <div className="text-slate-300 text-center mb-6">
            No answers recorded.
          </div>
        )}
        <div className="space-y-8">
          {answers.map((qa, i) => (
            <div
              key={i}
              className="bg-slate-900 rounded-xl p-5 border-l-4 border-blue-700 mb-8"
            >
              <div className="mb-2 text-slate-200 font-semibold">
                Q{i + 1}: {qa.question}
              </div>
              <div className="mb-2">
                <video
                  src={qa.videoBlob ? URL.createObjectURL(qa.videoBlob) : ""}
                  controls
                  className="rounded-lg border border-slate-600 w-64"
                />
              </div>
              {qa.sampleAnswer && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-2 text-yellow-900">
                  <strong>Sample Answer: </strong>
                  <span className="italic">{qa.sampleAnswer}</span>
                </div>
              )}
              {qa.tips && qa.tips.length > 0 && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-3 text-green-900">
                  <strong>Expert Tips:</strong>
                  <ul className="list-disc ml-6">
                    {qa.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={onRestart}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition mt-6"
        >
          Restart Interview
        </button>
      </div>
    </div>
  );
}
