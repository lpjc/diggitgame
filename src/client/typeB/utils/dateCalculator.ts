const REDDIT_REDESIGN_DATE = new Date('2018-04-01').getTime();

/**
 * Calculate BRR/ARR date format
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted string like "2¼ BRR" or "1 ARR"
 */
export function calculateBRRDate(timestamp: number): string {
  const diffMs = Math.abs(timestamp - REDDIT_REDESIGN_DATE);
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);

  const wholeYears = Math.floor(diffYears);
  const fraction = diffYears - wholeYears;

  let fractionSymbol = '';
  if (fraction >= 0.75) {
    fractionSymbol = '¾';
  } else if (fraction >= 0.5) {
    fractionSymbol = '½';
  } else if (fraction >= 0.25) {
    fractionSymbol = '¼';
  }

  const yearString = wholeYears === 0 ? fractionSymbol : `${wholeYears}${fractionSymbol}`;
  const era = timestamp < REDDIT_REDESIGN_DATE ? 'BRR' : 'ARR';

  return `${yearString} ${era}`.trim();
}

/**
 * Calculate actual age in years and months
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted string like "5 years, 3 months old"
 */
export function calculateActualAge(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;

  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  const months = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44)
  );

  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''} old`;
  }

  return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} old`;
}

/**
 * Format large numbers with K/M suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
