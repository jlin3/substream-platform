import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import TrainingClient from './training-client';

export const dynamic = 'force-dynamic';

export default async function TrainingDataPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return <TrainingClient slug={session.orgSlug} />;
}
