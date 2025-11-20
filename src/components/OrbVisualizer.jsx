const OrbVisualizer = ({ isActive, audioLevel }) => {
  // Smooth out the audio level for visualization
  // We use a minimum scale so it's visible even when silent
  const scale = 1 + Math.min(audioLevel * 4, 1.5);

  // Colors
  const coreColor = isActive ? "bg-blue-500" : "bg-slate-600";
  const glowColor = isActive ? "bg-blue-400" : "bg-slate-500";
  const ringColor = isActive ? "border-blue-400/30" : "border-slate-600/30";

  return (
    <div className="relative flex items-center justify-center w-80 h-80">
      {/* Outer Rotating Ring */}
      <div
        className={`absolute rounded-full border-[1px] ${ringColor} transition-all duration-500`}
        style={{
          width: "300px",
          height: "300px",
          animation: `spin 10s linear infinite`,
          opacity: isActive ? 0.6 : 0.2,
        }}
      />

      {/* Middle Rotating Ring (Reverse) */}
      <div
        className={`absolute rounded-full border-[1px] border-dashed ${ringColor} transition-all duration-500`}
        style={{
          width: "240px",
          height: "240px",
          animation: `spin-reverse 15s linear infinite`,
          opacity: isActive ? 0.8 : 0.3,
        }}
      />

      {/* Audio Reactive Glow Field */}
      <div
        className={`absolute rounded-full ${glowColor} mix-blend-screen filter blur-3xl transition-all duration-75 ease-out`}
        style={{
          width: `${180 * scale}px`,
          height: `${180 * scale}px`,
          opacity: isActive ? 0.3 + audioLevel : 0.1,
        }}
      />

      {/* Inner Pulse Glow */}
      <div
        className={`absolute rounded-full ${glowColor} mix-blend-screen filter blur-xl transition-all duration-100 ease-out`}
        style={{
          width: `${140 * scale}px`,
          height: `${140 * scale}px`,
          opacity: isActive ? 0.4 + audioLevel : 0.2,
        }}
      />

      {/* Core Orb */}
      <div
        className={`relative z-10 rounded-full ${coreColor} shadow-2xl shadow-blue-900/50 transition-transform duration-100 ease-out`}
        style={{
          width: "120px",
          height: "120px",
          transform: `scale(${1 + audioLevel * 0.3})`,
        }}
      >
        {/* Internal highlight gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-black/20 to-transparent" />
      </div>

      <style>{`
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            @keyframes spin-reverse {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
            }
        `}</style>
    </div>
  );
};

export default OrbVisualizer;
