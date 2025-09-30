import { cookies } from 'next/headers';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth/server';
import { redirect } from 'next/navigation';

import { runWithAmplifyServerContext } from '@/utils/amplifyServerUtils';
import NewUserMeasurements from '@/components/new-measurement';
import { IUserWithMeasurements } from '@/types/user';

interface UserMeasurementsNewPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserMeasurementsNewPage({ params }: UserMeasurementsNewPageProps) {
  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchAuthSession(contextSpec),
  });
  const { userId } = await params;
  const idToken = session?.tokens?.idToken?.toString();
  if (!idToken) {
    redirect('/measurements');
  }
  const attributes = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchUserAttributes(contextSpec),
  });
  const isAdminAttribute = attributes['custom:isAdmin'];
  const isAdmin = isAdminAttribute && isAdminAttribute === 'true' ? true : false;
  if (!isAdmin) {
    redirect('/measurements');
  }
  const userRes = await fetch(`https://api-dev.ravasa.net/user/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (!userRes.ok) {
    redirect('/measurements');
  }
  const user: IUserWithMeasurements = await userRes.json();
  return (
    <>
      <h3 className="text-3xl">Mediciones de {user.given_name}</h3>
      <NewUserMeasurements userId={user.sub} />
    </>
  );
}
