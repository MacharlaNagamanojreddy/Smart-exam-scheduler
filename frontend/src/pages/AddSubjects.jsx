import { useMemo, useState } from "react";
import useLiveQuery from "../hooks/useLiveQuery";
import { subjectsApi } from "../lib/api";

export default function AddSubjects() {
  const [form, setForm] = useState({
    code: "",
    name: "",
    department: "",
    semester: "1",
    preferredSlot: "any",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const { data: subjects, error, refresh, lastSyncedAt } = useLiveQuery(
    async () => (await subjectsApi.list()).data,
    { initialData: [] }
  );

  const sortedSubjects = useMemo(
    () => [...subjects].sort((a, b) => (a.code || "").localeCompare(b.code || "")),
    [subjects]
  );

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addSubject = async () => {
    try {
      setSaving(true);
      setMessage("");
      await subjectsApi.add({
        code: form.code.trim(),
        name: form.name.trim(),
        department: form.department.trim(),
        semester: Number(form.semester),
        preferredSlot: form.preferredSlot,
      });
      setForm({
        code: "",
        name: "",
        department: "",
        semester: "1",
        preferredSlot: "any",
      });
      setMessage("Subject added and synced.");
      refresh();
    } catch (err) {
      setMessage(err?.response?.data?.error || "Failed to add subject");
    } finally {
      setSaving(false);
    }
  };

  const deleteSubject = async (code) => {
    try {
      await subjectsApi.remove(code);
      refresh();
    } catch (err) {
      setMessage(err?.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Add Subjects</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          className="border p-3 rounded w-full"
          placeholder="Subject Code"
          name="code"
          value={form.code}
          onChange={onChange}
        />
        <input
          className="border p-3 rounded w-full"
          placeholder="Subject Name"
          name="name"
          value={form.name}
          onChange={onChange}
        />
        <input
          className="border p-3 rounded w-full"
          placeholder="Department"
          name="department"
          value={form.department}
          onChange={onChange}
        />
        <input
          className="border p-3 rounded w-full"
          placeholder="Semester"
          name="semester"
          type="number"
          min="1"
          value={form.semester}
          onChange={onChange}
        />
        <select
          className="border p-3 rounded w-full"
          name="preferredSlot"
          value={form.preferredSlot}
          onChange={onChange}
        >
          <option value="any">Any Slot</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
        </select>
      </div>

      <button
        className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-60"
        onClick={addSubject}
        disabled={saving}
      >
        {saving ? "Adding..." : "Add Subject"}
      </button>

      <p className="mt-3 text-sm text-gray-500">
        {lastSyncedAt
          ? `Live sync: ${lastSyncedAt.toLocaleTimeString()}`
          : "Waiting for sync..."}
      </p>
      {(message || error) && (
        <p className="mt-3 text-sm text-red-600">{message || error}</p>
      )}

      <div className="mt-6 bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 font-medium">Subjects</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Dept</th>
                <th className="px-4 py-2">Sem</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedSubjects.map((subject) => (
                <tr key={subject.code} className="border-t">
                  <td className="px-4 py-2">{subject.code}</td>
                  <td className="px-4 py-2">{subject.name}</td>
                  <td className="px-4 py-2">{subject.department}</td>
                  <td className="px-4 py-2">{subject.semester}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-red-600"
                      onClick={() => deleteSubject(subject.code)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sortedSubjects.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={5}>
                    No subjects found
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
