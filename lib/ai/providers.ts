import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

import {customProvider,extractReasoningMiddleware,wrapLanguageModel} from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {artifactModel,chatModel,reasoningModel,titleModel} from './models.test';

const CHAT_MODEL_NAME = process.env.CHAT_MODEL;
const REASONING_MODEL_NAME = process.env.REASONING_MODEL;
const TITLE_MODEL_NAME = process.env.TITLE_MODEL;
const ARTIFACT_MODEL_NAME = process.env.ARTIFACT_MODEL;
const IMAGE_MODEL_NAME = process.env.IMAGE_MODEL;

if (!CHAT_MODEL_NAME) {
  throw new Error("Missing environment variable: CHAT_MODEL");
}
if (!REASONING_MODEL_NAME) {
  throw new Error("Missing environment variable: REASONING_MODEL");
}
if (!TITLE_MODEL_NAME) {
  throw new Error("Missing environment variable: TITLE_MODEL");
}
if (!ARTIFACT_MODEL_NAME) {
  throw new Error("Missing environment variable: ARTIFACT_MODEL");
}
if (!IMAGE_MODEL_NAME) {
  throw new Error("Missing environment variable: IMAGE_MODEL");
}

const CHAT_ID = 'chat-model';
const REASONING_ID = 'chat-model-reasoning';
const TITLE_ID = 'title-model';
const ARTIFACT_ID = 'artifact-model';

export const IMAGE_ID = 'image-model';

const openaiProvider = createOpenAI({
  baseURL: process.env.OPENAI_API_BASE,
  apiKey: process.env.OPENAI_API_KEY,
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        [CHAT_ID]: chatModel,
        [REASONING_ID]: reasoningModel,
        [TITLE_ID]: titleModel,
        [ARTIFACT_ID]: artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        [CHAT_ID]: openaiProvider(CHAT_MODEL_NAME),
        [REASONING_ID]: wrapLanguageModel({
          model: openaiProvider(REASONING_MODEL_NAME),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        [TITLE_ID]: openaiProvider(TITLE_MODEL_NAME),
        [ARTIFACT_ID]: openaiProvider(ARTIFACT_MODEL_NAME),
      },
      imageModels: {[IMAGE_ID]: openaiProvider.image(IMAGE_MODEL_NAME)}
    });
