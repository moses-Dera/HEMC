import { getMe } from '@/lib/api';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const user = await getMe();
  if (!user) redirect('/login');

  return <ProfileClient user={user} />;
}
