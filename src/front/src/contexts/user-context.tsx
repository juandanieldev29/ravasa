'use client';

import { useState, useEffect, createContext, Dispatch, SetStateAction, ReactNode } from 'react';
import { fetchAuthSession, AuthSession } from '@aws-amplify/auth';

export const UserContext = createContext<
  [AuthSession | null, Dispatch<SetStateAction<AuthSession | null>>]
>(null!);

export default function UserContextProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  const fetchSession = async () => {
    const session = await fetchAuthSession();
    setSession(session);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return <UserContext.Provider value={[session, setSession]}>{children}</UserContext.Provider>;
}
