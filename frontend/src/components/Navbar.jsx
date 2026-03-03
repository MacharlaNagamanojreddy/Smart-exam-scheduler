import { useState } from "react";
import Modal from "./Modal";
import { authApi } from "../lib/api";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const hasToken = Boolean(localStorage.getItem("authToken"));

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const login = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await authApi.login(form.email, form.password);
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("authUser", JSON.stringify(response.data.user));
      setOpen(false);
      setError("");
      window.location.reload();
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    window.location.reload();
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-blue-100 gap-4">
        <h1 className="text-xl font-semibold">Smart Exam Scheduler</h1>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-3 py-1 rounded-full border ${
              hasToken
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {hasToken ? "Live Sync On" : "Login Needed"}
          </span>
          {hasToken ? (
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 btn-neutral text-sm"
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="px-4 py-2 btn-blue text-sm"
            >
              Login
            </button>
          )}
        </div>
      </div>

      <Modal open={open}>
        <form onSubmit={login} className="w-[360px] outline-panel p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
          <input
            className="input-blue mb-3"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
          />
          <input
            className="input-blue mb-3"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
          />
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 btn-neutral"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 btn-blue disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
