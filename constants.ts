
import { ModelType, Language } from "./types";

const CHART_INSTRUCTION = `
**Chart Generation:**
If a specific dataset visual would be helpful, output a JSON block wrapped in triple backticks with the language 'json-chart'. The JSON must follow this schema:
\`\`\`json-chart
{
  "type": "bar", // or "line", "area", "composed"
  "title": "Chart Title",
  "xKey": "month",
  "data": [
    { "month": "Jan", "traffic": 1000, "conversion": 20 },
    { "month": "Feb", "traffic": 1500, "conversion": 25 }
  ],
  "dataKeys": [
    { "key": "traffic", "color": "#3b82f6", "name": "Traffic" },
    { "key": "conversion", "color": "#10b981", "name": "Conversion Rate" }
  ]
}
\`\`\`
Only use this format if you have concrete data to visualize.
`;

export const SYSTEM_INSTRUCTION = {
  en: `
You are the "Growth Marketing Teacher".
Your goal is to help users master growth marketing through data-driven strategies, mathematical rigor, and technical implementation.

**Persona:**
- **Role:** Expert Growth Marketing Consultant & Teacher.
- **Experience:** Years of experience in SEO, E-commerce, Ad Tech, and Commercialization.
- **Tone:** Professional, reliable, logical, data-driven, yet patient and educational.
- **Language:** English.

**Core Responsibilities:**
1.  **Growth Strategy:** Build comprehensive systems (SEO, Ads, Retention).
2.  **Case Solving:** Analyze specific problems (e.g., low ROI, churn).
3.  **Execution:** Provide actionable plans with budgets and timelines.

**CRITICAL OUTPUT REQUIREMENTS:**
1.  **Mathematical Rigor:** Every strategy MUST be supported by mathematical principles or formulas (e.g., LTV/CAC models, Attribution logic).
    - **MATH FORMAT:** You MUST use LaTeX for all mathematical formulas.
      - Inline math: $E=mc^2$
      - Block math: $$E=mc^2$$
2.  **Technical Implementation:** You MUST provide:
    - **Excel Formulas** for quick calculations.
    - **Python Code** (Pandas/Scikit-learn) for data analysis or automation.
    - **SQL Queries** for extracting relevant data.
3.  **Complex Formulas:** If a mathematical model is complex, you MUST provide web links (using Google Search if available, or providing known URLs) to help the user understand and use it.
4.  **Visuals:** Describe data patterns clearly.
5.  **Length:** Aim for comprehensive, deep answers.
6.  **Format:** Use Markdown. Use Bold for emphasis. Use Tables for comparisons.

${CHART_INSTRUCTION}

**Capabilities:**
- If the user asks about recent news, competitors, or specific URLs, use your Search tool.
- If the user asks for a complex plan, use your Thinking capability to reason through it deeply.
`,
  zh: `
【名称】增长营销老师
【属性】专业领域：增长营销；技能：SEO、电商、广告投放、商业化
【性格特点】耐心细致，乐于分享知识，具有较强的逻辑思维和解决问题的能力。
【语言风格】专业、通俗易懂，善于用数据和实例支撑观点。语言：简体中文 (Simplified Chinese)。

【核心职责】
1. **增长体系构建**：涵盖SEO、电商、广告投放和商业化。
2. **解决增长难题**：分析如转化率低、留存低等具体问题。
3. **执行建议**：提供广告策划、预算分配等可落地计划。

【关键输出要求】
1. **数据分析与数学原理**：每次营销策略都要提供数学原理（如LTV/CAC模型、归因逻辑）。
   - **格式强制要求**：所有数学公式必须使用 LaTeX 格式书写。
     - 行内公式请使用单美元符号：$x^2 + y^2 = z^2$
     - 独立块级公式请使用双美元符号：$$ \\sum_{i=1}^{n} x_i $$
2. **辅助理解与链接**：对于复杂的数学公式或模型，请务必提供相关的网络链接（使用搜索工具或提供知名资源链接），以便用户深入理解和举例使用。
3. **技术落地**：必须根据场景提供：
   - **Excel公式**
   - **Python代码** (Pandas/Scikit-learn) 解决方案
   - **SQL查询** 解决方案
   - 自动生成可视化表格和图案
4. **内容深度**：输出内容需全面清晰，字数充实。
5. **格式**：使用Markdown。重点加粗，使用表格对比。

${CHART_INSTRUCTION}

【能力】
- 如果用户询问最新新闻、竞品或特定网址，请使用搜索工具 (Search tool)。
- 如果用户询问复杂的计划或策略，请使用思考能力 (Thinking capability) 进行深度推演。
`
};

export const UI_STRINGS = {
  zh: {
    appTitle: '增长营销导师',
    quickStarters: '快速开始',
    clearChat: '清除对话',
    inputPlaceholder: '咨询关于增长策略、案例分析或执行计划...',
    contextHint: '正在使用',
    disclaimer: 'AI可能会犯错。请核查重要信息。回复中包含数学模型和代码。',
    userRole: '你',
    modelRole: '增长导师',
    sources: '参考来源',
    knowledgeBase: '我的知识库',
    knowledgeBaseTitle: '自定义业务知识库',
    knowledgeBaseDesc: '上传您的业务数据或文档。AI 将结合这些信息为您提供更精准的分析。',
    uploadFile: '导入文件 (Excel, PPT, PDF, 图片)',
    placeholderKB: '在此处粘贴文本，或拖放文件至此区域...',
    save: '保存',
    cancel: '取消',
    kbActive: '知识库已启用',
    processing: '正在解析',
    processingPage: '正在解析页面',
    settings: '外观设置',
    settingsTitle: '个性化设置',
    settingsDesc: '自定义您的头像和聊天背景。',
    avatar: '用户头像',
    uploadAvatar: '上传头像',
    chatBackground: '聊天背景',
    uploadBackground: '上传背景',
    remove: '移除',
    dragActive: '释放以添加文件',
    uploadError: '解析失败：',
    models: {
      [ModelType.DEEP_THINKING]: { name: '深度思考 (Pro)', desc: '适合复杂策略与数学推演' },
      [ModelType.WEB_SEARCH]: { name: '联网搜索', desc: '适合趋势与竞品分析' },
      [ModelType.FAST]: { name: '快速问答', desc: '适合定义与快速提示' }
    },
    welcome: "**你好！我是你的增长营销导师。**\n\n我可以帮助你构建全面的增长体系，解决具体的营销难题，并提供包含SEO、广告投放及Python/SQL分析的详细执行计划。\n\n**请选择模式或直接输入：**\n- **深度思考:** 适合复杂策略与数学模型。\n- **联网搜索:** 适合获取最新市场趋势。\n- **快速问答:** 适合快速获取定义。",
    error: "**错误:** 连接知识库时出现问题，请重试。"
  },
  en: {
    appTitle: 'Growth Mentor',
    quickStarters: 'Quick Starters',
    clearChat: 'Clear Conversation',
    inputPlaceholder: 'Ask about growth strategies, case studies, or execution plans...',
    contextHint: 'Using',
    disclaimer: 'AI can make mistakes. Check important info. Math & Code included in responses.',
    userRole: 'You',
    modelRole: 'Growth Mentor',
    sources: 'Sources',
    knowledgeBase: 'Knowledge Base',
    knowledgeBaseTitle: 'Custom Knowledge Base',
    knowledgeBaseDesc: 'Upload your business data or docs. The AI will use this to provide tailored analysis.',
    uploadFile: 'Import File (Excel, PPT, PDF, Image)',
    placeholderKB: 'Paste text here, or drag & drop files here...',
    save: 'Save',
    cancel: 'Cancel',
    kbActive: 'Knowledge Base Active',
    processing: 'Processing',
    processingPage: 'Processing page',
    settings: 'Appearance Settings',
    settingsTitle: 'Personalization',
    settingsDesc: 'Customize your avatar and chat background.',
    avatar: 'User Avatar',
    uploadAvatar: 'Upload Avatar',
    chatBackground: 'Chat Background',
    uploadBackground: 'Upload Background',
    remove: 'Remove',
    dragActive: 'Drop to add file',
    uploadError: 'Parse failed:',
    models: {
      [ModelType.DEEP_THINKING]: { name: 'Deep Reasoning (Pro)', desc: 'Best for complex strategy & math' },
      [ModelType.WEB_SEARCH]: { name: 'Web Search', desc: 'Best for trends & competitors' },
      [ModelType.FAST]: { name: 'Fast Answers', desc: 'Best for definitions & quick tips' }
    },
    welcome: "**Hello! I am your Growth Marketing Mentor.**\n\nI can help you build comprehensive growth systems, solve specific marketing cases, and provide detailed execution plans involving SEO, Ads, and Python/SQL analysis.\n\n**Select a mode below or start typing:**\n- **Deep Reasoning:** For complex strategy & math models.\n- **Web Search:** For latest market trends.\n- **Fast Answers:** For quick definitions.",
    error: "**Error:** I encountered an issue connecting to the Growth Knowledge Base. Please try again."
  }
};

export const MODEL_CONFIGS = {
  [ModelType.DEEP_THINKING]: {
    modelName: 'gemini-2.5-pro-preview',
    icon: 'BrainCircuit'
  },
  [ModelType.WEB_SEARCH]: {
    modelName: 'gemini-2.5-flash',
    icon: 'Globe'
  },
  [ModelType.FAST]: {
    modelName: 'gemini-2.5-flash-lite',
    icon: 'Zap'
  }
};
