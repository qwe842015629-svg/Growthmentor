import { GoogleGenAI, Tool } from "@google/genai";
import { ModelType, Message, Language } from "../types";
import { SYSTEM_INSTRUCTION, MODEL_CONFIGS } from "../constants";

// Initialize the client. We assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function extractInformationFromImage(base64Data: string, mimeType: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Please transcribe all text visible in this image. If there are tables, charts, or diagrams, describe them in detail in text format so the data and structure can be perfectly understood and reconstructed as a text-based knowledge base."
          }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error("Failed to extract information from image.");
  }
}

export async function generateGeminiResponse(
  history: Message[],
  modelType: ModelType,
  language: Language,
  knowledgeBase?: string
): Promise<{ text: string; groundingMetadata?: any }> {
  
  const currentMessage = history[history.length - 1];
  const previousHistory = history.slice(0, -1).map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  const modelName = MODEL_CONFIGS[modelType].modelName;

  let tools: Tool[] | undefined = undefined;
  let thinkingConfig: any = undefined;

  // Configure specific model parameters
  if (modelType === ModelType.WEB_SEARCH) {
    tools = [{ googleSearch: {} }];
  } else if (modelType === ModelType.DEEP_THINKING) {
    // Enable thinking for Pro model
    thinkingConfig = { thinkingBudget: 32768 };
  }

  try {
    let finalSystemInstruction = SYSTEM_INSTRUCTION[language];

    // Inject Knowledge Base if present
    if (knowledgeBase && knowledgeBase.trim()) {
       finalSystemInstruction += `\n\n=== USER PROVIDED KNOWLEDGE BASE ===\nThe user has provided the following specific context/knowledge base about their business or situation (parsed from text, Excel, or images). Use this information to tailor your response, referencing it specifically where relevant:\n\n${knowledgeBase}\n\n=== END KNOWLEDGE BASE ===`;
    }

    const config: any = {
      // Select the system instruction based on the current language
      systemInstruction: finalSystemInstruction,
    };

    if (tools) config.tools = tools;
    if (thinkingConfig) config.thinkingConfig = thinkingConfig;

    // We use the 'chats' API for history management
    const chat = ai.chats.create({
      model: modelName,
      history: previousHistory,
      config: config
    });

    const result = await chat.sendMessage({
      message: currentMessage.content
    });

    // Extract grounding metadata if available (for Search model)
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let webSources = [];
    
    if (groundingChunks) {
       webSources = groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          uri: chunk.web.uri,
          title: chunk.web.title
        }));
    }

    return {
      text: result.text || "I couldn't generate a text response. Please try again.",
      groundingMetadata: webSources.length > 0 ? { web: webSources } : undefined
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
