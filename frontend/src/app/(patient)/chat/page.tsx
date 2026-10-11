import { getActiveChatSession } from '@/lib/chatActions';
import ChatClient from './ChatClient';

export default async function ChatPage() {
  const initialSession = await getActiveChatSession();

  return <ChatClient initialSession={initialSession} />;
}
