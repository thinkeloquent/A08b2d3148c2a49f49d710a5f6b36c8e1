import { useEffect, useState } from "react";
import { fetchApps } from "../services/api";

export function useApps() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApps()
      .then(setApps)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { apps, loading, error };
}
