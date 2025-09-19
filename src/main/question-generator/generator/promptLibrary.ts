import { ExamStyle } from './../settings/settingsModel';
import { logInfo } from '../../error-handle';

function log(message: string) {
  logInfo(`[promptLibrary] ${message}`);
}

// function questionSchemaMaker(questionOptions: string, answer: string, questionStyle): string {
//   return `{
//   type: 'object',
//   properties: {
//     questionStyle: {
//       type: 'string',
//       enum: [${questionStyle}]
//     },
//     question: { type: 'string' },
//     options: ${questionOptions}
//     answer: ${answer}
//   },
//   required: ['question']
// };`;
// }

// function generateQuestionSchemaByName(questionStyle: string): string {
//   let isExists = false;
//   for (const style of supportedQuestionStyles) {
//     if (style === questionStyle) {
//       isExists = true;
//       break;
//     }
//   }
//   if (!isExists) {
//     throw new Error(`Unknown question style: ${questionStyle}`);
//   }
//   let questionPrompt = questionSchemaMaker(
//     questionConfig[questionStyle].options,
//     questionConfig[questionStyle].answer,
//     questionStyle
//   );
//   return questionPrompt;
// }

const TEST_STYLE_PROMPT = {
  TOEIC: 'Pretend that you are the TOEIC test maker. Create the question like TOEIC style.',
  IELTS: 'Pretend that you are the IELTS test maker. Create the question like IELTS style.',
  TOEFL: 'Pretend that you are the TOEFL test maker. Create the question like TOEFL style.'
};

export interface PromptOptions {
  article: string;
  amount?: number;
  style?: ExamStyle;
  questionStyles: string[];
}

const base = `
    You are an AI assistant to generate multiple-choice questions from a given article.
    You are an AI assistant to generate multiple-choice questions from a given article.

    1. Output MUST be a **raw JSON array only**. Do NOT include any comments, explanations, or code blocks (like \`\`\`json).
    2. Do NOT add any extra phrases such as "Here are the questions" or "\`\`\`json".
    3. Output format must be exactly like this per question:
    4. Return question objects inside a JSON array.
    5. All questions and answers must be in English.
    6. The answer index must be random (0\–3) and correspond to the correct answer.
`;

function buildPrompt(options: PromptOptions): string {
  const { article, style, questionStyles } = options;
  let prompt = base;
  // question amount
  prompt += `    - Please generate exactly ${options.amount} questions.`;
  prompt += `     - You can generate ${String(questionStyles)} questions.`;
  //test style
  if (style) {
    switch (style) {
      case 'TOEIC':
        prompt += `   ${TEST_STYLE_PROMPT.TOEIC}`;
        break;
      case 'IELTS':
        prompt += `    ${TEST_STYLE_PROMPT.IELTS}`;
        break;
      case 'TOEFL':
        prompt += `    ${TEST_STYLE_PROMPT.TOEFL}`;
        break;
      default:
        prompt += `     ${TEST_STYLE_PROMPT.TOEIC}`;
        prompt += `    ${TEST_STYLE_PROMPT.IELTS}`;
        prompt += `     ${TEST_STYLE_PROMPT.TOEFL}`;
    }
  } else {
    prompt += `    ${TEST_STYLE_PROMPT.TOEIC}`;
    prompt += `     ${TEST_STYLE_PROMPT.IELTS}`;
    prompt += `    ${TEST_STYLE_PROMPT.TOEFL}`;
  }
  prompt += `  - The format of the questions should be as the following JSON schema and description:`;
  prompt += `{
     "questionStyle": "selection",
     "question": "string",
     "options": ["string", "string", "string", "string"],
     "answer": number
   }`;
  prompt += `Please make sure to strictly follow the guidelines above when generating questions. `;
  prompt += `Here is the Article: ${article}`;
  log(prompt);
  return prompt;
}

export { buildPrompt };
