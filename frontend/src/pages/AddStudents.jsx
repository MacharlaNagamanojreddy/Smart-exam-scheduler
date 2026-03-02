import { useMemo, useState } from "react";
import useLiveQuery from "../hooks/useLiveQuery";
import { studentsApi } from "../lib/api";

export default function AddStudents() {
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    email: "",
    department: "",
    semester: "1",
    subjects: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const { data: students, error, refresh, lastSyncedAt } = useLiveQuery(
    async () => (await studentsApi.list()).data,
    { initialData: [] }
  );

  const sortedStudents = useMemo(
    () => [...students].sort((a, b) => (a.studentId || "").localeCompare(b.studentId || "")),
    [students]
  );

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addStudent = async () => {
    try {
      setSaving(true);
      setMessage("");
      await studentsApi.add({
        studentId: form.studentId.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        semester: Number(form.semester),
        subjects: form.subjects
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setForm({
        studentId: "",
        name: "",
        email: "",
        department: "",
        semester: "1",
        subjects: "",
      });
      setMessage("Student added and synced.");
      refresh();
    } catch (err) {
      setMessage(err?.response?.data?.error || "Failed to add student");
    } finally {
      setSaving(false);
    }
  };

  const deleteStudent = async (studentId) => {
    try {
      await studentsApi.remove(studentId);
      refresh();
    } catch (err) {
      setMessage(err?.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Add Students</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          className="border p-3 rounded w-full"
          placeholder="Student ID (ex: S101)"
          name="studentId"
          value={form.studentId}
          onChange={onChange}
        />
        <input
          className="border p-3 rounded w-full"
          placeholder="Student Name"
          name="name"
          value={form.name}
          onChange={onChange}
        />
        <input
          className="border p-3 rounded w-full"
          placeholder="Email"
          name="email"
          type="email"
          value={form.email}
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
        <input
          className="border p-3 rounded w-full"
          placeholder="Subjects by code/name (comma separated)"
          name="subjects"
          value={form.subjects}
          onChange={onChange}
        />
      </div>

      <button
        className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-60"
        onClick={addStudent}
        disabled={saving}
      >
        {saving ? "Adding..." : "Add Student"}
      </button>

      <p className="mt-3 text-sm text-gray-500">
        {lastSyncedAt
          ? `Live sync: ${lastSyncedAt.toLocaleTimeString()}`
          : "Waiting for sync..."}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        Tip: Enter subject codes (preferred) or names, e.g. <code>11122,11123</code> or <code>c++,ai</code>.
      </p>

      {(message || error) && (
        <p className="mt-3 text-sm text-red-600">{message || error}</p>
      )}

      <div className="mt-6 bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 font-medium">Students</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Dept</th>
                <th className="px-4 py-2">Sem</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student) => (
                <tr key={student.studentId} className="border-t">
                  <td className="px-4 py-2">{student.studentId}</td>
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.department}</td>
                  <td className="px-4 py-2">{student.semester}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-red-600"
                      onClick={() => deleteStudent(student.studentId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sortedStudents.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={5}>
                    No students found
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
