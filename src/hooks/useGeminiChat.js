import { useState, useRef } from "react";
import axios from "axios";

export default function useGeminiChat({ apiKey }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to send user message and stream Gemini response
  const sendMessage = async (userText) => {
    setLoading(true);
    setError("");
    // First, add user message to chat
    setMessages((msgs) => [...msgs, { role: "user", text: userText }]);

    const systemPrompt = {
      role: "system",
      content:
        "You are a helpful AI interview assistant. Give concise, friendly, and expert guidance.",
    };
    const conversation = [
      systemPrompt,
      ...messages.map(({ role, text }) => ({
        role: role === "ai" ? "model" : role,
        content: text,
      })),
      { role: "user", content: userText },
    ];

    // Prepare for streaming
    let streamedText = "";

    try {
      // NOTE: This example uses fetch, but you could also do it with axios if you configure responseType: "stream"
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-latest:streamGenerateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: conversation.map(({ role, content }) => ({
              parts: [{ text: content }],
            })),
          }),
        }
      );

      if (!response.body) throw new Error("No stream received.");

      const reader = response.body.getReader();
      let decoder = new TextDecoder();
      let aiMsgIdx = null;

      // Optimistically add a streaming AI message
      setMessages((msgs) => {
        aiMsgIdx = msgs.length;
        return [...msgs, { role: "ai", text: "" }];
      });

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          let chunk = decoder.decode(value, { stream: true });
          // Gemini streaming responses: split on newlines (StreamingResponse chunks)
          chunk.split("\n").forEach((line) => {
            if (!line.trim()) return;
            try {
              const obj = JSON.parse(line);
              const part = obj?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (part) {
                streamedText += part;
                setMessages((msgs) => {
                  // Update last AI message
                  const msgsCopy = [...msgs];
                  msgsCopy[aiMsgIdx] = { role: "ai", text: streamedText };
                  return msgsCopy;
                });
              }
            } catch (e) {
              // Ignore partial/incomplete JSON
            }
          });
        }
      }
    } catch (err) {
      setError("Sorry, AI could not respond: " + err.message);
      setMessages((msgs) => [
        ...msgs,
        { role: "ai", text: "(AI Error: Unable to reply)" },
      ]);
    }
    setLoading(false);
  };

  return { messages, loading, error, sendMessage, setMessages };
}
