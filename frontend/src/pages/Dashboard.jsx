import Card from "../components/Card";
import useLiveQuery from "../hooks/useLiveQuery";
import { hallsApi, scheduleApi, studentsApi, subjectsApi } from "../lib/api";

export default function Dashboard() {
  const {
    data: stats,
    loading,
    error,
    lastSyncedAt,
  } = useLiveQuery(async () => {
    const [students, subjects, halls, scheduleStats] = await Promise.all([
      studentsApi.list(),
      subjectsApi.list(),
      hallsApi.list(),
      scheduleApi.stats(),
    ]);

    return {
      students: students.data.length,
      subjects: subjects.data.length,
      halls: halls.data.length,
      scheduleGenerated: (scheduleStats.data.totalExams || 0) > 0 ? "Yes" : "No",
    };
  }, { initialData: { students: 0, subjects: 0, halls: 0, scheduleGenerated: "No" } });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Live Dashboard</h2>
        <p className="text-sm text-gray-500">
          {lastSyncedAt
            ? `Last sync: ${lastSyncedAt.toLocaleTimeString()}`
            : "Waiting for first sync..."}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card title="Total Students" value={loading ? "..." : stats.students} />
        <Card title="Total Subjects" value={loading ? "..." : stats.subjects} />
        <Card title="Total Halls" value={loading ? "..." : stats.halls} />
        <Card
          title="Schedule Generated"
          value={loading ? "..." : stats.scheduleGenerated}
        />
      </div>
    </div>
  );
}
