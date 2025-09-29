'use client';

import { useState, useEffect, useContext } from 'react';

import UserCard from '@/components/user-card';
import { LoadingContext } from '@/contexts/loading-context';
import { UserContext } from '@/contexts/user-context';
import { LoadingAction } from '@/enums/loading-action';
import { IUser } from '@/types/user';

export default function Measurements() {
  const [session] = useContext(UserContext);
  const [users, setUsers] = useState<IUser[]>([]);
  const { dispatch } = useContext(LoadingContext);

  const fetchUsers = async () => {
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      if (!session?.tokens?.idToken) {
        return;
      }
      const idToken = session.tokens.idToken.toString();
      const response = await fetch('https://api-dev.ravasa.net/user', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const fetchedUsers: IUser[] = await response.json();
      setUsers(fetchedUsers);
    } catch (err) {
      console.log(err);
    } finally {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <div className="grid md:grid-cols-2 2xl:grid-cols-4 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          return (
            <UserCard key={user.sub} id={user.sub} text={user.email} title={user.given_name} />
          );
        })}
      </div>
    </>
  );
}
