import { useState } from "react";

export default function useGeminiChat({ apiKey }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async (userText) => {
    setLoading(true);
    setError("");
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

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
      const result = await res.json();
      const aiText =
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "(AI Error: No response)";
      setMessages((msgs) => [...msgs, { role: "ai", text: aiText }]);
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
