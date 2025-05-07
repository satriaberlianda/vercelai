'use server';

import { generateText } from 'ai'; // UIMessage is no longer needed for generateTitleFromUserMessage
import { cookies } from 'next/headers';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatTitleById, // Import the new query
  updateChatVisiblityById,
} from '@/lib/db/queries';
import type { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/providers';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  userContent,
  assistantContent,
}: {
  userContent: string;
  assistantContent: string;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    temperature: 1,
    system: `
    ### Task:
    Generate a very concise and specific title (2-4 words maximum) for the following conversation snippet.
    The title must be in the same language as the conversation.
    Focus on the main subject or keywords of the conversation.
    Avoid generic phrases, questions, or conversational filler.
    Do NOT use quotation marks or any special formatting.
    RESPOND ONLY WITH THE TITLE TEXT.
    ### Examples:
    - Python Code Help
    - Cat Image Request
    - Recipe: Chocolate Chip
    - Music Evolution
    - Productivity Tips
    - JavaScript Debugging`,
    prompt: `User: ${userContent}\nAssistant: ${assistantContent}`,
  });

  return title;
}

export async function generateAndUpdateChatTitle({
  chatId,
  userMessageContent,
  assistantMessageContent,
}: {
  chatId: string;
  userMessageContent: string;
  assistantMessageContent: string;
}) {
  try {
    const title = await generateTitleFromUserMessage({
      userContent: userMessageContent,
      assistantContent: assistantMessageContent,
    });
    await updateChatTitleById({ chatId, title });
  } catch (error) {
    console.error('Failed to generate and update chat title:', error);
    // Optionally, handle or log this error more gracefully
  }
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
