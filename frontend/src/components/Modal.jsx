export default function Modal({ open, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-lg">{children}</div>
    </div>
  );
}
