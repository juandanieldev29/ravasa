import { cookies } from 'next/headers';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth/server';
import { redirect } from 'next/navigation';

import { runWithAmplifyServerContext } from '@/utils/amplifyServerUtils';
import NewUserMeasurements from '@/components/new-measurement';

interface UserMeasurementsNewPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserMeasurementsNewPage({ params }: UserMeasurementsNewPageProps) {
  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchAuthSession(contextSpec),
  });
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
  return (
    <>
      <h3 className="text-3xl">Mediciones de {attributes.given_name}</h3>
      <NewUserMeasurements userId={attributes.sub!} />
    </>
  );
}
