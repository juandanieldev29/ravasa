import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full flex shadow-sm">
      <h1 className="text-5xl grow px-4">
        <Link href="/">Ravasa</Link>
      </h1>
      <nav className="flex self-center px-4">
        <Link href="/measurements">Mediciones</Link>
      </nav>
    </header>
  );
}
