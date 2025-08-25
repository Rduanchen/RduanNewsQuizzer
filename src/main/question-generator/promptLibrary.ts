import { ExamStyle, supportedQuestionStyles, questionConfig } from './settings/settingsModel';
import { logInfo } from '../error-handle';

function log(message: string) {
  logInfo(`[promptLibrary] ${message}`);
}

function questionSchemaMaker(questionOptions: string, answer: string, questionStyle): string {
  return `{
  type: 'object',
  properties: {
    questionStyle: {
      type: 'string',
      enum: [${questionStyle}]
    },
    question: { type: 'string' },
    options: ${questionOptions}
    answer: ${answer}
  },
  required: ['question']
};`;
}

function generateQuestionSchemaByName(questionStyle: string): string {
  if (!(questionStyle in supportedQuestionStyles)) {
    throw new Error(`Unknown question style: ${questionStyle}`);
  }
  let questionPrompt = questionSchemaMaker(
    questionConfig[questionStyle].options,
    questionConfig[questionStyle].answer,
    questionStyle
  );
  return questionPrompt;
}

const TEST_STYLE_PROMPT = {
  TOEIC: 'Pretend that you are the TOEIC test maker. Create the question like TOEIC style.',
  IELTS: 'Pretend that you are the IELTS test maker. Create the question like IELTS style.',
  TOEFL: 'Pretend that you are the TOEFL test maker. Create the question like TOEFL style.'
};

interface PromptOptions {
  article: string;
  amount?: number;
  style?: ExamStyle;
  questionStyles: string[];
}

const base = `
    You are an AI assistant to generate multiple-choice questions from a given article.
    - Your reply must be in JSON format ONLY.
    - All questions and answers must be in English.
    - The answer index must be random but within the range of available options and correspond to the correct answer.
`;

function buildPrompt(options: PromptOptions): string {
  const { article, style, questionStyles } = options;
  let prompt = base;
  // question amount
  prompt += `\n      - Please generate exactly ${options.amount} questions.`;
  prompt += `\n      - You can generate ${String(questionStyles)} questions.`;
  //test style
  if (style) {
    switch (style) {
      case 'TOEIC':
        prompt += `\n      ${TEST_STYLE_PROMPT.TOEIC}`;
        break;
      case 'IELTS':
        prompt += `\n      ${TEST_STYLE_PROMPT.IELTS}`;
        break;
      case 'TOEFL':
        prompt += `\n      ${TEST_STYLE_PROMPT.TOEFL}`;
        break;
      default:
        prompt += `\n      ${TEST_STYLE_PROMPT.TOEIC}`;
        prompt += `\n      ${TEST_STYLE_PROMPT.IELTS}`;
        prompt += `\n      ${TEST_STYLE_PROMPT.TOEFL}`;
    }
  } else {
    prompt += `\n      ${TEST_STYLE_PROMPT.TOEIC}`;
    prompt += `\n      ${TEST_STYLE_PROMPT.IELTS}`;
    prompt += `\n      ${TEST_STYLE_PROMPT.TOEFL}`;
  }
  prompt += `\n      - The format of the questions should be as the following JSON schema and description:`;

  for (const qs of questionStyles) {
    prompt += `\n      ${generateQuestionSchemaByName(qs)}`;
    prompt += `\n      ${questionConfig[qs].prompt}`;
  }
  prompt += `\n Please make sure to strictly follow the guidelines above when generating questions. `;
  prompt += `Here is the Article: ${article}`;
  log(prompt);
  return prompt;
}

export { buildPrompt };
