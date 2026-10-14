import { useCallback, useEffect, useState } from 'react';

import { getHomeFeed, type FeedSection } from '@/common/youtube/client';

// Kept across visits to Home so switching tabs does not refetch; refreshed after a while.
const FRESH_FOR_MS = 30 * 60 * 1000;
let cache: { sections: FeedSection[]; at: number } | null = null;

/** YouTube Music's home shelves, with pull-to-refresh. */
export function useHomeFeed() {
  const [result, setResult] = useState<{ sections?: FeedSection[]; error?: string }>(() => (cache ? { sections: cache.sections } : {}));
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(
    () =>
      getHomeFeed().then(
        (sections) => {
          cache = { sections, at: Date.now() };
          setResult({ sections });
        },
        // Keep whatever was already on screen; only say that the update failed.
        (error: unknown) => setResult((previous) => ({ ...previous, error: error instanceof Error ? error.message : String(error) })),
      ),
    [],
  );

  useEffect(() => {
    if (cache && Date.now() - cache.at < FRESH_FOR_MS) return;
    fetchFeed();
  }, [fetchFeed]);

  const refresh = () => {
    setRefreshing(true);
    fetchFeed().finally(() => setRefreshing(false));
  };

  return { sections: result.sections, error: result.error, loading: !result.sections && !result.error, refreshing, refresh };
}
