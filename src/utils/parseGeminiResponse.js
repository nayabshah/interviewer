export default function parseGeminiResponse(text) {
  const questionMatch = text.match(/Question:(.*?)(?:\n|$)/);
  const sampleAnswerMatch = text.match(/Sample Answer:(.*?)(?:\n|$)/);
  const tipsMatch = text.match(/Tips:([\s\S]*)/);

  const question = questionMatch ? questionMatch[1].trim() : "";
  const sampleAnswer = sampleAnswerMatch ? sampleAnswerMatch[1].trim() : "";
  let tips = [];

  if (tipsMatch) {
    tips = tipsMatch[1]
      .split("\n")
      .map((tip) => tip.replace(/^- /, "").trim())
      .filter(Boolean);
  }

  return { question, sampleAnswer, tips };
}
