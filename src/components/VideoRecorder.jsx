import React, { useRef, useState } from "react";

export default function VideoRecorder({ onRecorded, recording, setRecording }) {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const videoRef = useRef();

  async function startRecording() {
    setPreviewUrl(null);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    videoRef.current.srcObject = stream;

    let recorder = new window.MediaRecorder(stream, { mimeType: "video/webm" });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) setChunks((prev) => [...prev, e.data]);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setPreviewUrl(URL.createObjectURL(blob));
      onRecorded(blob);
      stream.getTracks().forEach((track) => track.stop());
      setChunks([]);
    };
    setMediaRecorder(recorder);
    recorder.start();
    setRecording(true);
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
    setRecording(false);
  }

  return (
    <div className="flex flex-col items-center mb-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-full flex flex-col items-center shadow-md">
        <video
          ref={videoRef}
          className="border-2 border-blue-600 rounded-lg mt-2 mb-4 bg-black max-w-full"
          autoPlay
          playsInline
          muted
          style={{
            display: recording ? "block" : previewUrl ? "block" : "none",
            width: 320,
            height: 240,
          }}
          src={previewUrl || undefined}
          controls={!!previewUrl}
        />
        <div className="flex space-x-4 mb-2">
          {!recording && (
            <button
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
              onClick={startRecording}
            >
              Record Answer
            </button>
          )}
          {recording && (
            <button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition animate-pulse"
              onClick={stopRecording}
            >
              Stop Recording
            </button>
          )}
        </div>
        <div className="mt-1 h-5 text-red-400 font-medium">
          {recording ? "Recording..." : ""}
        </div>
        {previewUrl && !recording && (
          <div className="mt-2 text-slate-400 text-xs">
            Preview your answer above or re-record if needed.
          </div>
        )}
      </div>
    </div>
  );
}
