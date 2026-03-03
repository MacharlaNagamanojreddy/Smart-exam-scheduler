import { useMemo, useState } from "react";
import useLiveQuery from "../hooks/useLiveQuery";
import { hallsApi } from "../lib/api";

export default function AddHalls() {
  const [form, setForm] = useState({
    hallId: "",
    name: "",
    capacity: "",
    building: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const { data: halls, error, refresh, lastSyncedAt } = useLiveQuery(
    async () => (await hallsApi.list()).data,
    { initialData: [] }
  );

  const sortedHalls = useMemo(
    () => [...halls].sort((a, b) => (a.hallId || "").localeCompare(b.hallId || "")),
    [halls]
  );

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addHall = async () => {
    try {
      setSaving(true);
      setMessage("");
      await hallsApi.add({
        hallId: form.hallId.trim(),
        name: form.name.trim() || form.hallId.trim(),
        capacity: Number(form.capacity),
        building: form.building.trim(),
      });
      setForm({
        hallId: "",
        name: "",
        capacity: "",
        building: "",
      });
      setMessage("Hall added and synced.");
      refresh();
    } catch (err) {
      setMessage(err?.response?.data?.error || "Failed to add hall");
    } finally {
      setSaving(false);
    }
  };

  const deleteHall = async (hallId) => {
    try {
      await hallsApi.remove(hallId);
      refresh();
    } catch (err) {
      setMessage(err?.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Add Halls</h2>

      <div className="outline-panel p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            className="input-blue"
            placeholder="Hall ID"
            name="hallId"
            value={form.hallId}
            onChange={onChange}
          />
          <input
            className="input-blue"
            placeholder="Hall Name"
            name="name"
            value={form.name}
            onChange={onChange}
          />
          <input
            className="input-blue"
            placeholder="Capacity"
            name="capacity"
            type="number"
            min="1"
            value={form.capacity}
            onChange={onChange}
          />
          <input
            className="input-blue"
            placeholder="Building"
            name="building"
            value={form.building}
            onChange={onChange}
          />
        </div>

        <button
          className="px-6 py-3 btn-blue disabled:opacity-60"
          onClick={addHall}
          disabled={saving}
        >
          {saving ? "Adding..." : "Add Hall"}
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-500">
        {lastSyncedAt
          ? `Live sync: ${lastSyncedAt.toLocaleTimeString()}`
          : "Waiting for sync..."}
      </p>
      {(message || error) && (
        <p className="mt-3 text-sm text-red-600">{message || error}</p>
      )}

      <div className="mt-6 table-surface">
        <div className="px-4 py-3 border-b bg-gray-50 font-medium">Halls</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-2">Hall ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Capacity</th>
                <th className="px-4 py-2">Building</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedHalls.map((hall) => (
                <tr key={hall.hallId} className="border-t table-row-hover">
                  <td className="px-4 py-2">{hall.hallId}</td>
                  <td className="px-4 py-2">{hall.name}</td>
                  <td className="px-4 py-2">{hall.capacity}</td>
                  <td className="px-4 py-2">{hall.building}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-red-600 hover:text-red-700 hover:underline"
                      onClick={() => deleteHall(hall.hallId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sortedHalls.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={5}>
                    No halls found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
