'use client';

import { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession, fetchUserAttributes, signOut } from '@aws-amplify/auth';
import { Amplify, ResourcesConfig } from 'aws-amplify';

import '@aws-amplify/ui-react/styles.css';

const config: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
      identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID!,
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_USER_POOL_DOMAIN_URL!,
          scopes: ['openid', 'profile', 'email', 'aws.cognito.signin.user.admin'],
          redirectSignIn: ['https://dev.d27xqlna0b9pop.amplifyapp.com/'],
          redirectSignOut: ['https://dev.d27xqlna0b9pop.amplifyapp.com/'],
          responseType: 'code',
        },
      },
      allowGuestAccess: true,
    },
  },
};

Amplify.configure(config, { ssr: true });

export default function Measurements() {
  const [givenName, setGivenName] = useState<null | string>(null);
  const [email, setEmail] = useState<null | string>(null);
  const fetchUserProfile = async () => {
    const session = await fetchAuthSession();
    if (!session.tokens?.idToken) {
      console.log('There is no auth session');
      signOut();
      return;
    }
    const { email, given_name } = await fetchUserAttributes();
    if (!email || !given_name) {
      console.log('User does not have email or given name');
      signOut();
      return;
    }
    setEmail(email);
    setGivenName(given_name);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <Authenticator.Provider>
      <Authenticator socialProviders={['google']} signUpAttributes={['email']}>
        {givenName && (
          <>
            <p>Hola {givenName}</p>
            <p>Tu correo es {email}</p>
          </>
        )}
      </Authenticator>
    </Authenticator.Provider>
  );
}
