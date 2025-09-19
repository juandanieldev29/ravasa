'use client';

import { useState, useEffect, useContext } from 'react';
import { fetchAuthSession, fetchUserAttributes, signOut } from '@aws-amplify/auth';

import { LoadingContext } from '@/contexts/loading-context';
import { LoadingAction } from '@/enums/loading-action';

export default function UserProfile() {
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
    <>
      {givenName && (
        <>
          <p>Hola {givenName}</p>
          <p>Tu correo es {email}</p>
          <p>Eres administrador? {isAdmin ? 'Si' : 'No'}</p>
        </>
      )}
    </>
  );
}
