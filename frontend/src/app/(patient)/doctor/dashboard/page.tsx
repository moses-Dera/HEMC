import { getDoctorOverview, getDoctorPatients, getDoctors, getMe } from '@/lib/api';
import { redirect } from 'next/navigation';
import DoctorDashboardClient from './DoctorDashboardClient';

export default async function DoctorDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ doctor_id?: string }>;
}) {
  const user = await getMe();

  if (!user || (user.role !== 'doctor' && user.role !== 'admin')) {
    redirect('/dashboard');
  }

  const resolvedParams = searchParams ? await searchParams : undefined;
  const targetDoctorId = resolvedParams?.doctor_id ? parseInt(resolvedParams.doctor_id, 10) : undefined;

  const [overview, patients, doctors] = await Promise.all([
    getDoctorOverview(targetDoctorId),
    getDoctorPatients(targetDoctorId),
    getDoctors(),
  ]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-32 md:pb-12 overflow-y-auto h-full">
      <DoctorDashboardClient
        initialOverview={overview}
        initialPatients={patients}
        doctorsList={doctors}
        userRole={user.role}
        selectedDoctorId={targetDoctorId || overview?.doctor_id}
      />
    </div>
  );
}
