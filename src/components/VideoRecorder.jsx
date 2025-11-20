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
    <div>
      <video
        ref={videoRef}
        className="video-preview"
        autoPlay
        playsInline
        muted
        style={{ display: recording ? "block" : previewUrl ? "block" : "none" }}
        src={previewUrl || undefined}
        controls={!!previewUrl}
      />
      <div>
        {!recording && <button onClick={startRecording}>Record Answer</button>}
        {recording && <button onClick={stopRecording}>Stop Recording</button>}
      </div>
      <div className="recording-status">{recording ? "Recording..." : ""}</div>
    </div>
  );
}
