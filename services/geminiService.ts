// services/geminiService.ts

// 1. 引用正确的官方库 (注意：是 GoogleGenerativeAI，不是 GoogleGenAI)
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ModelType, Message, Language } from "../types";
import { SYSTEM_INSTRUCTION, MODEL_CONFIGS } from "../constants";

export async function generateGeminiResponse(
  history: Message[],
  modelType: ModelType,
  language: Language,
  knowledgeBase?: string
) {
  // 2. 获取 API Key (安全写法)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ 致命错误: 未找到 API Key，请检查 Vercel 环境变量 VITE_GEMINI_API_KEY");
    // 返回一个假消息，避免让整个网页黑屏崩溃
    return { 
      text: "系统错误：未检测到 API Key。请联系管理员在 Vercel 后台配置 VITE_GEMINI_API_KEY。",
      groundingMetadata: null
    };
  }

  try {
    // 3. 【关键】在函数内部初始化，防止网页启动时崩溃
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 获取模型名称 (如果 constants.ts 里写错了，这里兜底用 flash)
    const configName = MODEL_CONFIGS[modelType]?.modelName || 'gemini-1.5-flash';
    // 确保不使用幻觉出来的 3.0 或 2.5 版本
    const safeModelName = configName.includes('gemini-3') || configName.includes('2.5') 
      ? 'gemini-1.5-flash' 
      : configName;

    const model = genAI.getGenerativeModel({ model: safeModelName });

    // 4. 转换历史记录格式 (把你的 Message 格式转成 Google API 需要的格式)
    const chatHistory = history.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // 5. 启动聊天
    const chat = model.startChat({
      history: chatHistory,
      // 如果你的库版本旧，可能不支持 systemInstruction，这里做了兼容
      systemInstruction: SYSTEM_INSTRUCTION ? { role: 'system', parts: [{ text: SYSTEM_INSTRUCTION[language] }] } : undefined,
    });

    // 6. 拼接知识库上下文
    const lastMsgContent = history[history.length - 1].content;
    const finalPrompt = knowledgeBase 
      ? `【知识库参考信息】:\n${knowledgeBase}\n\n【用户问题】:\n${lastMsgContent}` 
      : lastMsgContent;

    console.log("正在发送请求给模型:", safeModelName);
    const result = await chat.sendMessage(finalPrompt);
    const response = await result.response;
    
    return {
      text: response.text(),
      groundingMetadata: null 
    };

  } catch (error: any) {
    console.error("AI 请求失败:", error);
    // 优雅降级：返回错误提示，而不是让 APP 崩溃
    return {
      text: `请求出错: ${error.message || "未知网络错误"}`,
      groundingMetadata: null
    };
  }
}
