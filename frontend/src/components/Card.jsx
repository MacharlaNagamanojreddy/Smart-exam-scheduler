export default function Card({ title, value }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-md border">
      <p className="text-gray-600">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
}
