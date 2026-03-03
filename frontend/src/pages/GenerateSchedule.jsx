import { useState } from "react";
import { scheduleApi } from "../lib/api";
import useLiveQuery from "../hooks/useLiveQuery";

export default function GenerateSchedule() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { data: stats, refresh: refreshStats } = useLiveQuery(
    async () => (await scheduleApi.stats()).data,
    { initialData: { totalExams: 0, totalDays: 0 } }
  );

  const generate = async () => {
    try {
      setLoading(true);
      await scheduleApi.generate({ startDate });
      setMessage("Schedule Generated!");
      refreshStats();
    } catch (error) {
      setMessage(
        error?.response?.data?.error ||
          "Schedule generation failed. Please check API/auth."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Generate Schedule</h2>
      <div className="outline-panel p-5 max-w-lg">
        <div className="mb-4 max-w-sm">
          <label className="block text-sm mb-2 text-gray-600">Start Date</label>
          <input
            type="date"
            className="input-blue"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="px-6 py-3 btn-blue disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Schedule"}
        </button>
      </div>

      {message && <p className="mt-4 text-base font-semibold text-green-600">{message}</p>}

      <div className="mt-6 p-4 outline-panel max-w-md">
        <p className="text-gray-600">Live schedule snapshot</p>
        <p className="mt-2">Total Exams: <strong>{stats.totalExams || 0}</strong></p>
        <p>Total Days: <strong>{stats.totalDays || 0}</strong></p>
      </div>
    </div>
  );
}
