interface CardProps {
  title: string;
  text: string;
}

export default function Card({ title, text }: CardProps) {
  return (
    <div className="rounded-2xl shadow-lg p-4 transition-transform hover:scale-[1.03]">
      <h2 className="text-3xl">{title}</h2>
      <p>{text}</p>
    </div>
  );
}
