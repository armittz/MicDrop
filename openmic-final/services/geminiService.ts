import { GoogleGenAI, Modality } from "@google/genai";
import { AIFeedback, PowerWordsRephrases } from "../types";
import { FEEDBACK_SYSTEM_INSTRUCTION } from "../constants";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing VITE_GEMINI_API_KEY. Check your .env.local file.");
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Uses Gemini to analyze audio + transcript and return structured ESL feedback.
 */
export const getAIFeedback = async (
  audioBase64: string,
  prompt: string,
  transcript: string
): Promise<AIFeedback> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        parts: [
          {
            text: `
${FEEDBACK_SYSTEM_INSTRUCTION}

Prompt the student answered:
"${prompt}"

Student transcript (USE EXACTLY):
"${transcript}"
            `,
          },
          {
            inlineData: {
              mimeType: "audio/webm",
              data: audioBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const rawText = response.text;
  if (!rawText) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = JSON.parse(rawText);

  // 🔒 Hard enforcement so UI never silently fails
  if (
    parsed.status === "success" &&
    (!parsed.alternatives || parsed.alternatives.length === 0)
  ) {
    throw new Error("Gemini response missing alternatives");
  }

  return parsed as AIFeedback;
};

/**
 * Given a transcript, return two attention-grabbing "power words" and
 * two "perfect rephrases"—short alternate phrasings the student can use.
 */
export const getPowerWordsAndRephrases = async (
  transcript: string
): Promise<PowerWordsRephrases> => {
  const prompt = `Analyze the following transcript and return a JSON object with two arrays: \n1) \"powerWords\" - two concise, high-impact words or short phrases that capture the strongest ideas or emotional hooks in the transcript, and 2) \"rephrases\" - two polished, natural alternate phrasings (one sentence each) that a speaker could use to say the same idea more clearly or powerfully. Return ONLY valid JSON.\n\nTranscript (use exactly):\n"${transcript}"\n`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const raw = response.text;
  if (!raw) {
    throw new Error("Gemini returned empty response for power words");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    // If the model returned text with surrounding explanation, try to extract JSON block
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Unable to parse Gemini JSON for power words");
    }
  }

  // Normalize and validate
  const powerWords = Array.isArray(parsed.powerWords)
    ? parsed.powerWords.slice(0, 2).map(String)
    : [];
  const rephrases = Array.isArray(parsed.rephrases)
    ? parsed.rephrases.slice(0, 2).map(String)
    : [];

  // Ensure two items each (pad with empty strings if necessary)
  while (powerWords.length < 2) powerWords.push("");
  while (rephrases.length < 2) rephrases.push("");

  return { powerWords, rephrases } as PowerWordsRephrases;
};

/**
 * Converts text feedback into speech using Gemini TTS.
 */
export const generateSpeech = async (
  text: string
): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          parts: [
            {
              text: `Say this warmly and encouragingly:\n\n${text}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Kore",
            },
          },
        },
      },
    });

    return (
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null
    );
  } catch (error) {
    console.error("TTS Generation Error:", error);
    return null;
  }
};
