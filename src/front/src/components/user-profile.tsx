'use client';

import { useState, useEffect, useContext } from 'react';
import { fetchUserAttributes } from '@aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';

import { LoadingContext } from '@/contexts/loading-context';
import { UserContext } from '@/contexts/user-context';
import { LoadingAction } from '@/enums/loading-action';

export default function UserProfile() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const [session] = useContext(UserContext);
  const { dispatch } = useContext(LoadingContext);
  const [givenName, setGivenName] = useState<null | string>(null);
  const [email, setEmail] = useState<null | string>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserProfile = async () => {
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      if (!session?.tokens?.idToken) {
        console.log('There is no auth session');
        return;
      }
      const userAttributes = await fetchUserAttributes();

      if (!userAttributes['email'] || !userAttributes['given_name']) {
        console.log('User does not have email or given name');
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
    if (authStatus === 'authenticated') {
      fetchUserProfile();
    }
  }, [authStatus]);

  useEffect(() => {
    console.log(authStatus);
  }, [authStatus]);

  return (
    <>
      {givenName && (
        <>
          <h3 className="text-3xl">Hola {givenName}</h3>
          <p>Tu correo es {email}</p>
          <p>Eres administrador? {isAdmin ? 'Si' : 'No'}</p>
        </>
      )}
    </>
  );
}
