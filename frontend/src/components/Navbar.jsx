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
      <div className="flex items-center justify-between p-4 bg-white shadow-sm border-b gap-4">
        <h1 className="text-xl font-semibold">Smart Exam Scheduler</h1>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-3 py-1 rounded-full ${
              hasToken
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {hasToken ? "Live Sync On" : "Login Needed"}
          </span>
          {hasToken ? (
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm"
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
            >
              Login
            </button>
          )}
        </div>
      </div>

      <Modal open={open}>
        <form onSubmit={login} className="w-[360px]">
          <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
          <input
            className="border p-3 rounded w-full mb-3"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
          />
          <input
            className="border p-3 rounded w-full mb-3"
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
              className="px-4 py-2 rounded-lg border"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
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
