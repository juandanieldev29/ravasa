import { cookies } from 'next/headers';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { redirect } from 'next/navigation';

import { runWithAmplifyServerContext } from '@/utils/amplifyServerUtils';

import UserMeasurements from '@/components/user-measurements';
import { IUser } from '@/types/user';

interface UserMeasurementsPageProps {
  params: Promise<{ userId: string }>; // Declare params as a Promise
}

export default async function UserMeasurementsPage({ params }: UserMeasurementsPageProps) {
  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchAuthSession(contextSpec),
  });
  const { userId } = await params;
  const idToken = session?.tokens?.idToken?.toString();
  if (!session.tokens?.idToken) {
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
  const user: IUser & { ok: boolean } = await userRes.json();
  if (!user.ok) {
    redirect('/measurements');
  }
  return (
    <>
      <h3 className="text-3xl">Mediciones de {user.given_name}</h3>
      <UserMeasurements />
    </>
  );
}
