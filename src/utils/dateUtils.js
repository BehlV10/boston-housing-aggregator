/**
 * Date and recency utility functions for listing freshness filtering & display.
 */

export function parseDateSafe(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Returns a human-friendly relative time string (e.g., 'Just now', '2h ago', '3d ago', '2w ago')
 */
export function formatTimeAgo(dateStr) {
  const d = parseDateSafe(dateStr);
  if (!d) return 'Recently';

  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return 'Just now'; // in case of minor clock drift

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 14) return '1w ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

/**
 * Returns metadata about listing recency for badge display.
 */
export function getRecencyMeta(dateStr) {
  const d = parseDateSafe(dateStr);
  if (!d) {
    return {
      label: 'Recent',
      isNew: false,
      isFresh: true,
      isOutdated: false,
      hoursAgo: 0,
      daysAgo: 0,
    };
  }

  const diffMs = Math.max(0, Date.now() - d.getTime());
  const hoursAgo = diffMs / (1000 * 60 * 60);
  const daysAgo = hoursAgo / 24;

  const isNew = hoursAgo <= 24; // posted within last 24h
  const isFresh = daysAgo <= 7;  // posted within last 7 days
  const isOutdated = daysAgo > 14; // older than 2 weeks

  return {
    label: formatTimeAgo(dateStr),
    isNew,
    isFresh,
    isOutdated,
    hoursAgo,
    daysAgo,
    formattedDate: d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  };
}
