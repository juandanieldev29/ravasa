'use client';

import { useState, useEffect, useContext } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession, fetchUserAttributes, signOut } from '@aws-amplify/auth';
import { Amplify, ResourcesConfig } from 'aws-amplify';

import Spinner from '@/components/spinner';

import LoadingContextProvider from '@/contexts/loading-context';
import { LoadingContext } from '@/contexts/loading-context';
import { LoadingAction } from '@/enums/loading-action';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const { dispatch } = useContext(LoadingContext);

  const fetchUserProfile = async () => {
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      const session = await fetchAuthSession();
      if (!session.tokens?.idToken) {
        console.log('There is no auth session');
        signOut();
        return;
      }
      const userAttributes = await fetchUserAttributes();

      if (!userAttributes['email'] || !userAttributes['given_name']) {
        console.log('User does not have email or given name');
        signOut();
        return;
      }
      const isAdmin = userAttributes['custom:isAdmin'] === 'true' ? true : false;
      setEmail(userAttributes['email']);
      setGivenName(userAttributes['given_name']);
      setIsAdmin(isAdmin);
    } catch (err) {
      console.log(err);
    } finally {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <Authenticator.Provider>
      <Authenticator socialProviders={['google']} signUpAttributes={['email']}>
        <LoadingContextProvider>
          <Spinner />
          {givenName && (
            <>
              <p>Hola {givenName}</p>
              <p>Tu correo es {email}</p>
              <p>Eres administrador? {isAdmin ? 'Si' : 'No'}</p>
            </>
          )}
        </LoadingContextProvider>
      </Authenticator>
    </Authenticator.Provider>
  );
}
