import React from "react";

export default function LandingPage({ onStart }) {
  return (
    <div>
      <h1>AI Interviewer Demo</h1>
      <p>
        This app will ask you interview questions using AI and record your
        answers via video and audio.
        <br />
        You can review your answers at the end.
      </p>
      <ol>
        <li>Allow camera and microphone access when prompted.</li>
        <li>
          Answer the question after you click "Record", then "Stop Recording" to
          finish.
        </li>
        <li>Proceed to next question or finish the interview.</li>
      </ol>
      <button onClick={onStart}>Start Interview</button>
    </div>
  );
}
