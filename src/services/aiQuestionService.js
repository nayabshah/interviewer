import axios from "axios";

// !!! WARNING: For production, never expose your API key; use a backend server.
// Place your Gemini API key here for testing ONLY (move to backend for real usage!)
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
  import.meta.env.VITE_API_KEY;
// Fallback question bank if Gemini is unavailable
const questionBank = [
  "Tell me about yourself.",
  "Describe a recent technical project you worked on.",
  "What are your strengths and weaknesses?",
  "Where do you see yourself in five years?",
  "Explain a challenging problem you solved.",
  "Why should we hire you?",
  "How do you handle conflicting priorities?",
  "Describe your greatest achievement.",
  "Give an example of teamwork in your recent experience.",
  "How do you continue to learn new technologies?",
];

/**
 * Ask Gemini for a new interview question.
 * @param {number} index Optional: Pass in progress, topic, etc.
 */
export async function generateQuestion(index) {
  const prompt = {
    contents: [
      {
        parts: [
          {
            text: "Generate a single realistic technical interview question for a frontend or JavaScript developer. Keep it open-ended. Do NOT repeat previous questions.",
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(GEMINI_API_URL, prompt, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Parse Gemini's response
    const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (result && result.length > 10) return result.trim();
    throw new Error("Bad Gemini answer");
  } catch (err) {
    // Fallback to static
    console.error("Gemini API failed:", err);
    return questionBank[index % questionBank.length];
  }
}
