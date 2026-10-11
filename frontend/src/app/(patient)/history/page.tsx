import { Suspense } from 'react';
import { getChatSessions, getMyAppointments, getMe } from '@/lib/api';
import HistoryClient from './HistoryClient';

export default async function HistoryPage() {
  const [sessions, appointments, currentUser] = await Promise.all([
    getChatSessions(),
    getMyAppointments(),
    getMe(),
  ]);

  return (
    <Suspense fallback={<div>Loading history...</div>}>
      <HistoryClient sessions={sessions} appointments={appointments} currentUser={currentUser} />
    </Suspense>
  );
}
