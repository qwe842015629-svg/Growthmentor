import { GoogleGenerativeAI } from "@google/generative-ai";
import { ModelType, Message, Language } from "../types";
import { SYSTEM_INSTRUCTION, MODEL_CONFIGS } from "../constants";

export async function generateGeminiResponse(
  history: Message[],
  modelType: ModelType,
  language: Language,
  knowledgeBase?: string
) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ 致命错误: 未找到 API Key");
    return { 
      text: "系统错误：未检测到 API Key。请联系管理员在 Vercel 后台配置 VITE_GEMINI_API_KEY。",
      groundingMetadata: null
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 获取模型名称，兜底使用 flash
    const configName = MODEL_CONFIGS[modelType]?.modelName || 'gemini-1.5-flash';
    const safeModelName = configName.includes('gemini-3') || configName.includes('2.5') 
      ? 'gemini-1.5-flash' 
      : configName;

    const model = genAI.getGenerativeModel({ model: safeModelName });

    // 1. 转换历史记录格式
    let chatHistory = history.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // 2. 【关键修复】剔除第一条欢迎语（如果是 Model 发言）
    if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      chatHistory.shift();
    }

    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: SYSTEM_INSTRUCTION ? { role: 'system', parts: [{ text: SYSTEM_INSTRUCTION[language] }] } : undefined,
    });

    const lastMsgContent = history[history.length - 1].content;
    const finalPrompt = knowledgeBase 
      ? `【知识库参考信息】:\n${knowledgeBase}\n\n【用户问题】:\n${lastMsgContent}` 
      : lastMsgContent;

    const result = await chat.sendMessage(finalPrompt);
    const response = await result.response;
    
    return {
      text: response.text(),
      groundingMetadata: null 
    };

  } catch (error: any) {
    console.error("AI 请求失败:", error);
    return {
      text: `请求出错: ${error.message || "未知网络错误"}`,
      groundingMetadata: null
    };
  }
}

export async function extractInformationFromImage(base64Data: string, mimeType: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
      throw new Error("API Key missing");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    const result = await model.generateContent([
      "Please transcribe all text visible in this image.",
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);
    return result.response.text();
  } catch (error) {
    console.error("Image extraction failed:", error);
    return "Error parsing image: " + (error as any).message;
  }
}
