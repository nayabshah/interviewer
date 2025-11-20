import React, { useRef, useState, useEffect } from "react";

export default function VideoRecorder({ onRecorded, recording, setRecording }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const videoRef = useRef();
  const streamRef = useRef();
  const mediaRecorderRef = useRef();
  const chunksRef = useRef([]);

  async function startRecording() {
    setError("");
    setPreviewUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.src = "";
      }
      const mediaRecorder = new window.MediaRecorder(stream, {
        mimeType: "video/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        if (blob.size === 0) {
          setError("Recording is empty! Try again.");
          setPreviewUrl(null);
          return;
        }
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
        }
        onRecorded(blob);
        if (streamRef.current)
          streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (e) {
      setError("Could not access camera or mic: " + e.message);
    }
  }

  function stopRecording() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  useEffect(() => {
    if (!recording && previewUrl && videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = previewUrl;
    }
    // Cleanup: revoke previewUrl on unmount/change
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [recording, previewUrl]);

  return (
    <div className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 shadow mb-2 flex flex-col items-center">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <video
        ref={videoRef}
        className="border-2 border-blue-600 rounded-lg bg-black w-full max-w-xl aspect-video mb-4"
        autoPlay={recording}
        playsInline
        muted={recording}
        controls={!recording && !!previewUrl}
        style={{
          display: recording || previewUrl ? "block" : "none",
        }}
      />
      <div className="flex flex-wrap gap-4">
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
      <div className="mt-2 text-xs min-h-[1.25rem]">
        <span
          className={
            recording ? "text-red-400 font-semibold" : "text-slate-400"
          }
        >
          {recording
            ? "Recording..."
            : previewUrl
            ? "Preview above, re-record if needed."
            : ""}
        </span>
      </div>
    </div>
  );
}
