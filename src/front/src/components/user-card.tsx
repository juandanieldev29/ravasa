'use client';

import Link from 'next/link';

interface UserCardProps {
  title: string;
  text: string;
  id: string;
}

export default function UserCard({ title, text, id }: UserCardProps) {
  return (
    <div className="rounded-2xl shadow-lg p-4 transition-transform hover:scale-[1.01]">
      <h2 className="text-2xl">{title}</h2>
      <p className="mb-4 text-wrap">{text}</p>
      <Link href={`/measurements/${id}`} className="bg-slate-900 text-white p-2 rounded">
        Ver mediciones
      </Link>
    </div>
  );
}
