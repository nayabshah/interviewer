import React, { useState, useRef, useEffect } from "react";

// Dummy props: messages = [{role: "user"|"ai", text: string}], onSend: (txt)=>void, loading: bool
export default function GeminiChat({ messages = [], onSend, loading }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 px-1 pb-3"
      >
        {messages.length === 0 && (
          <div className="text-slate-500 italic pt-12 text-center text-sm">
            Gemini will chat here with tips, clarifications, and encouragement!
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm 
                ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none"
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-slate-400 text-xs italic">Gemini is typing…</div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full flex gap-2 items-center border-t border-slate-700 pt-2 mt-2"
      >
        <input
          type="text"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Gemini for help, feedback, or practice..."
          disabled={loading}
        />
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-sm shadow disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={!input.trim() || loading}
        >
          Send
        </button>
      </form>
    </div>
  );
}
