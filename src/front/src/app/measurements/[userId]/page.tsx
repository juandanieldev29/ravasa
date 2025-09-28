import UserMeasurements from '@/components/user-measurements';
import { IUser } from '@/types/user';

interface UserMeasurementsPageProps {
  params: Promise<{ userId: string }>; // Declare params as a Promise
}

export default async function UserMeasurementsPage({ params }: UserMeasurementsPageProps) {
  const { userId } = await params;
  const userRes = await fetch(`https://api-dev.ravasa.net/user/${userId}`, {
    cache: 'no-store',
  });
  const user: IUser = await userRes.json();
  return (
    <>
      <h3 className="text-3xl">Mediciones de {user.given_name}</h3>
      <UserMeasurements />
    </>
  );
}
