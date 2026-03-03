export default function Modal({ open, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-950/35 backdrop-blur-[2px] flex justify-center items-center p-4 z-40">
      {children}
    </div>
  );
}
