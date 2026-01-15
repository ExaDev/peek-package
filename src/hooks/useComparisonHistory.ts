import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

const HISTORY_KEY = "pkgcompare_history";

export interface HistoryEntry {
  packages: string[];
  timestamp: number;
}

export function useComparisonHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryEntry[];
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch {
      // If localStorage is not available or corrupted, just start with empty history
      setHistory([]);
    }
  }, []);

  const addToHistory = (packages: string[]) => {
    const entry: HistoryEntry = {
      packages,
      timestamp: Date.now(),
    };

    // Remove duplicate entries with same packages
    const filtered = history.filter(
      (h) => h.packages.join(",") !== packages.join(","),
    );

    // Keep last 10 entries
    const newHistory = [entry, ...filtered].slice(0, 10);

    setHistory(newHistory);

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch {
      // If localStorage fails, just update state
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // If localStorage fails, just update state
    }
  };

  const formatRelativeTime = (timestamp: number): string => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return { history, addToHistory, clearHistory, formatRelativeTime };
}
