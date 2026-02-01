import { GoogleGenAI, Modality } from "@google/genai";
import { AIFeedback } from "../types";
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
