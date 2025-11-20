import React, { useRef, useState, useEffect } from "react";

export default function VideoRecorder({ onRecorded, recording, setRecording }) {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const streamRef = useRef(null);
  const videoRef = useRef();

  async function startRecording() {
    setPreviewUrl(null);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.src = "";
    }

    let recorder = new window.MediaRecorder(stream, { mimeType: "video/webm" });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) setChunks((prev) => [...prev, e.data]);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
      }
      onRecorded(blob);
      stream.getTracks().forEach((track) => track.stop());
      setChunks([]);
      streamRef.current = null;
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

  // ---- Ensure correct video src/srcObject always set ----
  useEffect(() => {
    if (recording) {
      // Show live webcam stream during recording
      if (streamRef.current && videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.src = "";
      }
    } else if (previewUrl) {
      // Show preview on stop
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = previewUrl;
      }
    }
    // Cleanup: revoke preview URL when component unmounts or URL changes
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [recording, previewUrl]);

  return (
    <div className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 shadow mb-2 flex flex-col items-center">
      <video
        ref={videoRef}
        className="border-2 border-blue-600 rounded-lg bg-black w-full max-w-xl aspect-video mb-4"
        autoPlay={recording}
        playsInline
        muted={recording}
        controls={Boolean(previewUrl) && !recording}
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
