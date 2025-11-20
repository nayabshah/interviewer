import React from "react";

export default function ReviewPage({ answers, onRestart }) {
  return (
    <div>
      <h2>Review Your Interview</h2>
      {answers.length === 0 && <div>No answers recorded.</div>}
      {answers.map((qa, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <strong>
            Q{i + 1}: {qa.question}
          </strong>
          <div>
            {qa.videoBlob && (
              <video
                src={URL.createObjectURL(qa.videoBlob)}
                controls
                width="320"
                height="240"
              />
            )}
          </div>
        </div>
      ))}
      <button onClick={onRestart}>Restart Interview</button>
    </div>
  );
}
