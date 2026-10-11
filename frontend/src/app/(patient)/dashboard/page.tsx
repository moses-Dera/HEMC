import { getMe, getDoctors, getMyAppointments } from '@/lib/api';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const user = await getMe();
  if (!user) {
    redirect('/login');
  }

  const [doctors, appointments] = await Promise.all([
    getDoctors(),
    getMyAppointments(),
  ]);

  return <DashboardClient user={user} doctors={doctors} appointments={appointments} />;
}
