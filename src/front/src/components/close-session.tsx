'use client';

import { signOut } from 'aws-amplify/auth';

export default function CloseSession() {
  async function handleSignOut() {
    await signOut();
  }
  return (
    <button type="button" className="cursor-pointer text-white" onClick={handleSignOut}>
      Cerrar sesión
    </button>
  );
}
