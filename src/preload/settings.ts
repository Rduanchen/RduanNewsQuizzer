import { ipcRenderer } from 'electron';
import { Reply } from '../main/error-handle/index';
import { GenerateSettings } from '../main/question-generator/settings/settingsModel';
import { LMStudioSettings } from '../main/question-generator/settings/lmStudioSettings';
import { OpenAISettings } from '../main/question-generator/settings/openAISettings';

// Types for LLM option
interface LLMOption {
  source: string;
}

const settingsAPI = {
  // Question settings
  getQuestionSettings: async (): Promise<Reply> => {
    return await ipcRenderer.invoke('settings:get-questions-settings');
  },
  updateQuestionSettings: async (newSettings: GenerateSettings): Promise<Reply> => {
    return await ipcRenderer.invoke('settings:update-questions-settings', newSettings);
  },
  getCurrentQuestionSettings: async (): Promise<Reply> => {
    return await ipcRenderer.invoke('settings:get-current-questions-settings');
  },

  // LM Studio settings
  getLMStudioSettings: async (): Promise<Reply> => {
    return await ipcRenderer.invoke('settings:get-lm-studio-settings');
  },
  updateLMStudioSettings: async (newSettings: LMStudioSettings): Promise<Reply> => {
    return await ipcRenderer.invoke('settings:update-lm-studio-settings', newSettings);
  },
  verifyLMStudioLiveness: async (): Promise<Reply> => {
    return await ipcRenderer.invoke('settings:verify-lm-studio-liveness');
  },

  // OpenAI settings
  getOpenAISettings: async (): Promise<Reply> => {
    return await ipcRenderer.invoke('settings:get-openai-settings');
  },
  updateOpenAISettings: async (newSettings: OpenAISettings): Promise<Reply> => {
    return await ipcRenderer.invoke('settings:update-openai-settings', newSettings);
  },
  getOpenAIOptions: async (): Promise<Reply> => {
    return await ipcRenderer.invoke('settings:get-openai-options');
  },

  // LLM sources option
  getLLMSourcesOptions: async (): Promise<Reply> => {
    return await ipcRenderer.invoke('settings:get-llm-sources-options');
  },
  getCurrentLLMOption: async (): Promise<Reply> => {
    return await ipcRenderer.invoke('settings:get-current-llm-option');
  },
  setCurrentLLMOption: async (option: LLMOption): Promise<Reply> => {
    return await ipcRenderer.invoke('settings:set-current-llm-option', option);
  },
  isReadyToGenerate: async (): Promise<Reply> => {
    return await ipcRenderer.invoke('settings:verify-is-setting-ready');
  }
};

export default settingsAPI;
