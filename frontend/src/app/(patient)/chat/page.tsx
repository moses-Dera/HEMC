import { getActiveChatSession } from '@/lib/chatActions';
import ChatClient from './ChatClient';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const initialSession = await getActiveChatSession();

  return <ChatClient initialSession={initialSession} />;
}
