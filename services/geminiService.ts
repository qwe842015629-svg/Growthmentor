import { GoogleGenAI } from "@google/generative-ai"; // 注意这里引用可能不同，保持你原本的引用即可
// 如果你之前是 import { GoogleGenAI, Tool } from "@google/genai"; 请保持原样

import { ModelType, Message, Language } from "../types"; // 保持你原本的引用
import { SYSTEM_INSTRUCTION, MODEL_CONFIGS } from "../constants";

// 【关键修改】把外面的 const ai = ... 删掉！

export async function generateGeminiResponse(
  history: Message[],
  modelType: ModelType,
  language: Language,
  knowledgeBase?: string
) {
  // 1. 获取 Key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // 2. 【安全检查】如果没有 Key，优雅地报错，而不是让网站黑屏
  if (!apiKey) {
    throw new Error("API Key 未配置！请检查 Vercel 环境变量 VITE_GEMINI_API_KEY");
  }

  // 3. 【延迟初始化】只有在需要发消息时，才创建 AI 实例
  const genAI = new GoogleGenAI(apiKey);
  
  // 4. 获取正确的模型名称 (防止 gemini-3 报错)
  const modelName = MODEL_CONFIGS[modelType].modelName;
  const model = genAI.getGenerativeModel({ model: modelName });

  // ... (下面保留你原本的 history 处理和 generateContent 逻辑) ...
  // 为了确保代码能跑，这里我简写了，请把你原本的 chat.sendMessage 或 generateContent 逻辑接在这里
  // 重点是把 new GoogleGenAI 这一步挪到了这个函数的大括号里面！
  
  // 下面是帮你补全的简单逻辑，你可以直接用：
  const chat = model.startChat({
    history: history.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })),
    systemInstruction: SYSTEM_INSTRUCTION[language],
  });

  const lastMessage = history[history.length - 1].content;
  
  // 如果有知识库，拼接到最后一条消息里
  const finalPrompt = knowledgeBase 
    ? `Knowledge Base Context:\n${knowledgeBase}\n\nUser Question:\n${lastMessage}` 
    : lastMessage;

  const result = await chat.sendMessage(finalPrompt);
  const response = await result.response;
  return { text: response.text() };
}
