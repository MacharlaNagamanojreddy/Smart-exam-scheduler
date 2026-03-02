import { useCallback, useEffect, useRef, useState } from "react";

export default function useLiveQuery(fetcher, options = {}) {
  const { initialData = [], intervalMs = 5000, enabled = true } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError("");
      setLastSyncedAt(new Date());
    } catch (err) {
      const message =
        err?.response?.data?.error || err?.message || "Failed to sync data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
    if (!enabled || intervalMs <= 0) {
      return undefined;
    }
    const timer = setInterval(refresh, intervalMs);
    return () => clearInterval(timer);
  }, [enabled, intervalMs, refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    lastSyncedAt,
  };
}
