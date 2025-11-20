import axios from "axios";

// !!! WARNING: For production, never expose your API key; use a backend server.
// Place your Gemini API key here for testing ONLY (move to backend for real usage!)

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

export async function generateQuestion(
  index,
  { position, skills, experience }
) {
  const prompt = {
    contents: [
      {
        parts: [
          {
            text: `You are an expert interview coach. Generate one question for an HR or general interview round, for the position of "${position}", considering these skills: ${skills}. The candidate is at the ${experience} level.

1. Write the interview question.
2. Then, provide a short sample or ideal answer and 2-3 suggestions/tips for how a candidate should think about or structure their answer to this question. Help the candidate understand what kind of response would impress the interviewer.

Be concise and practical. Do not repeat previous questions.
Return your response in the following format:

Question: <the interview question>
Sample Answer: <model or ideal answer, one paragraph>
Tips:
- <tip 1>
- <tip 2>
- <tip 3>`,
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(GEMINI_API_URL, prompt, {
      headers: { "Content-Type": "application/json" },
    });
    const result = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (result && result.length > 10) return result.trim();
    throw new Error("Bad Gemini answer");
  } catch (err) {
    return "Question: Tell me about yourself.\nSample Answer: I am a frontend developer with a passion for building intuitive user interfaces and collaborating in teams.\nTips:\n- Highlight relevant experience\n- Show enthusiasm and positivity\n- Link your background to the requirements of the role";
  }
}
