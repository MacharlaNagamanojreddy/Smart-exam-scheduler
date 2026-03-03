export default function Card({ title, value }) {
  return (
    <div className="outline-panel p-6">
      <p className="text-slate-600">{title}</p>
      <h2 className="text-4xl md:text-5xl font-bold mt-2 tracking-tight">{value}</h2>
    </div>
  );
}
