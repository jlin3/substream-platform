import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import CompareClient from './compare-client';

export const dynamic = 'force-dynamic';

export default async function CompareHighlightsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return <CompareClient slug={session.orgSlug} />;
}
