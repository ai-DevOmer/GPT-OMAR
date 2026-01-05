
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_BASE, MODE_INSTRUCTIONS, MODEL_NAME } from "./constants";
import { AIMode, Attachment } from "./types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const sendMessage = async (
  prompt: string,
  history: any[],
  options: { 
    deepThinking: boolean; 
    webSearch: boolean;
    mode: AIMode;
    attachments?: Attachment[];
  }
) => {
  const ai = getAIClient();
  
  const systemInstruction = `${SYSTEM_INSTRUCTION_BASE}\n${MODE_INSTRUCTIONS[options.mode] || ''}`;

  const config: any = {
    systemInstruction,
    temperature: options.deepThinking ? 0.2 : 0.7,
  };

  if (options.deepThinking) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  if (options.webSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  // Improved Multimodal Attachment Handling
  const attachmentParts = (options.attachments || []).map(att => {
    // Extract base64 data regardless of prefix format
    const base64Data = att.data.includes(',') ? att.data.split(',')[1] : att.data;
    return {
      inlineData: {
        data: base64Data,
        mimeType: att.mimeType || 'application/octet-stream'
      }
    };
  });

  // Fix: Explicitly type userParts to avoid narrow type inference that prevents pushing { text: prompt }
  const userParts: any[] = [...attachmentParts];
  if (prompt.trim()) {
    userParts.push({ text: prompt });
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        ...history,
        { role: 'user', parts: userParts }
      ],
      config,
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title,
      }));

    return {
      text,
      urls,
      thinking: response.candidates?.[0]?.content?.parts?.find((p: any) => p.thought)?.text || ""
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
