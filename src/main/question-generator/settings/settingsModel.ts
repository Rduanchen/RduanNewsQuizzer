const supportModels = [
  {
    id: 'gpt-5',
    category: 'GPT-5',
    price: '1.25'
  },
  {
    id: 'gpt-5-mini',
    category: 'GPT-5',
    price: '0.25'
  },
  {
    id: 'gpt-5-nano',
    category: 'GPT-5',
    price: '0.05'
  },
  {
    id: 'gpt-4.1',
    category: 'GPT-4.1',
    price: '2.00'
  },
  {
    id: 'gpt-4.1-mini',
    category: 'GPT-4.1',
    price: '0.40'
  },
  {
    id: 'gpt-4.1-nano',
    category: 'GPT-4.1',
    displayName: 'GPT-4.1 Nano'
  }
];

const reasoningEffort = [
  {
    title: '低',
    value: 'low',
    description: '快速生成，適合簡單文章'
  },
  {
    title: '中',
    value: 'medium',
    description: '平衡速度與品質'
  },
  {
    title: '高',
    value: 'high',
    description: '深度分析，適合複雜文章'
  }
];

const questionConfig = {
  selection: {
    name: 'selection',
    options: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    answer: {
      type: 'number'
    },
    required: ['options', 'answer'],
    prompt: `Create a multiple-choice question with one correct answer and several distractors, the return of "selection" question json format must be the following format: { question: "string", options: ["string"], answer: number }, the option could be random, but the answer must be the index of the selected option.`
  }
};
// const supportedQuestionStyles = Object.keys(questionConfig);
const supportedQuestionStyles = ['selection'];

const TestStyle = [
  {
    name: 'TOEIC',
    description: 'for TOEIC candidate'
  },
  {
    name: 'TOFEL',
    description: 'for TOFEL candidate'
  },
  {
    name: 'IELTS',
    description: 'for IELTS candidate'
  },
  {
    name: 'ALL',
    description: 'mix test style'
  }
];

enum ExamStyle {
  TOEIC = 'TOEIC',
  IELTS = 'IELTS',
  TOEFL = 'TOEFL',
  ALL = 'ALL'
}

const SupportedQuestionsStyle = [
  {
    name: 'selection',
    description: 'single select question'
  }
];

interface GenerateSettings {
  questionAmount: number;
  questionStyle: string[];
  testStyle: 'TOEIC' | 'IELTS' | 'TOEFL' | 'ALL';
}

export {
  supportModels,
  TestStyle,
  reasoningEffort,
  supportedQuestionStyles,
  questionConfig,
  type GenerateSettings,
  ExamStyle,
  SupportedQuestionsStyle
};
