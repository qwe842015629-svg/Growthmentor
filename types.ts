
export enum ModelType {
  DEEP_THINKING = 'DEEP_THINKING',
  WEB_SEARCH = 'WEB_SEARCH',
  FAST = 'FAST'
}

export type Language = 'zh' | 'en';

export interface UserSettings {
  avatar?: string;
  backgroundImage?: string;
}

export interface ChartData {
  type: 'bar' | 'line' | 'area' | 'composed';
  title: string;
  data: any[];
  xKey: string;
  dataKeys: { key: string; color: string; name?: string }[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  modelType?: ModelType;
  isLoading?: boolean;
  groundingMetadata?: {
    web?: { uri: string; title: string }[];
  };
}

export interface AppState {
  messages: Message[];
  isTyping: boolean;
  currentModel: ModelType;
  error?: string;
  language: Language;
}

export const MARKETING_TOPICS: Record<Language, { id: string; title: string; prompt: string; icon: string }[]> = {
  en: [
    {
      id: 'system',
      title: 'Build Growth System',
      prompt: 'Help me build a comprehensive growth marketing system for a [Business Type]. Include SEO, Ads, and Retention strategies.',
      icon: 'Layout'
    },
    {
      id: 'case',
      title: 'Solve Growth Case',
      prompt: 'I have a problem with [Specific Metric, e.g., low retention] in my e-commerce app. Analyze the potential causes and provide solutions with SQL queries to diagnose it.',
      icon: 'Briefcase'
    },
    {
      id: 'execution',
      title: 'Execution Plan',
      prompt: 'Create a detailed execution plan for a [Campaign Type] campaign with a budget of $[Amount]. Include budget allocation math and Python code for tracking.',
      icon: 'PlayCircle'
    }
  ],
  zh: [
    {
      id: 'system',
      title: '构建增长体系',
      prompt: '帮我为[业务类型]构建一个全面的增长营销体系，包括SEO、广告投放和用户留存策略。',
      icon: 'Layout'
    },
    {
      id: 'case',
      title: '解决增长难题',
      prompt: '我的电商应用在[具体指标，如留存率]方面遇到问题。请分析潜在原因，并提供SQL查询语句来诊断问题。',
      icon: 'Briefcase'
    },
    {
      id: 'execution',
      title: '制定执行计划',
      prompt: '为预算$[金额]的[活动类型]活动创建一个详细的执行计划。包括预算分配数学模型和用于追踪的Python代码。',
      icon: 'PlayCircle'
    }
  ]
};
