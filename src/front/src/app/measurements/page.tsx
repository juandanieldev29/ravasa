'use client';

import { Authenticator } from '@aws-amplify/ui-react';

import Spinner from '@/components/spinner';
import UserProfile from '@/components/user-profile';
import Measurements from '@/components/measurements';

import LoadingContextProvider from '@/contexts/loading-context';

export default function MeasurementsPage() {
  return (
    <Authenticator.Provider>
      <LoadingContextProvider>
        <Spinner />
        <Authenticator socialProviders={['google']} signUpAttributes={['email']}>
          <UserProfile />
          <Measurements />
        </Authenticator>
      </LoadingContextProvider>
    </Authenticator.Provider>
  );
}
