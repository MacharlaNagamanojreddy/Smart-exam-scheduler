import useLiveQuery from "../hooks/useLiveQuery";
import { scheduleApi, studentsApi } from "../lib/api";

export default function Timetable() {
  const { data: timetable, loading, error, lastSyncedAt } = useLiveQuery(
    async () => (await scheduleApi.all()).data,
    { initialData: [], intervalMs: 4000 }
  );
  const { data: students } = useLiveQuery(
    async () => (await studentsApi.list()).data,
    { initialData: [], intervalMs: 4000 }
  );

  const getLiveStudentsCount = (exam) => {
    const examCode = String(exam.subjectCode || "").trim().toLowerCase();
    const examName = String(exam.subjectName || "").trim().toLowerCase();

    return students.filter((student) => {
      return (student.subjects || []).some((subjectRef) => {
        const ref = String(subjectRef || "").trim().toLowerCase();
        return ref && (ref === examCode || ref === examName);
      });
    }).length;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Exam Timetable</h2>
      <p className="text-sm text-gray-500 mb-4">
        {lastSyncedAt
          ? `Auto-sync every 4s. Last sync: ${lastSyncedAt.toLocaleTimeString()}`
          : "Waiting for first sync..."}
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Hall</th>
              <th className="px-4 py-3">Students (Live)</th>
            </tr>
          </thead>
          <tbody>
            {loading && timetable.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={5}>
                  Loading timetable...
                </td>
              </tr>
            )}
            {!loading && timetable.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={5}>
                  Generated timetable will appear here...
                </td>
              </tr>
            )}
            {timetable.map((exam) => (
              <tr
                key={`${exam.subjectCode}-${exam.date}-${exam.slot}-${exam.hall}`}
                className="border-t"
              >
                <td className="px-4 py-2">{exam.date}</td>
                <td className="px-4 py-2">{exam.slot}</td>
                <td className="px-4 py-2">
                  <div className="font-medium">{exam.subjectCode}</div>
                  <div className="text-gray-500">{exam.subjectName}</div>
                </td>
                <td className="px-4 py-2">{exam.hall}</td>
                <td className="px-4 py-2">
                  {getLiveStudentsCount(exam)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
