import AppError from './AppError.js';

export const RANGES = [
  { value: 'all_time', label: 'All time' },
  { value: 'this_year', label: 'This year' },
  { value: 'this_month', label: 'This month' },
  { value: 'this_week', label: 'This week' },
];

export const DEFAULT_RANGE = 'all_time';

export function resolveRange(raw) {
  if (raw === undefined || raw === '') return DEFAULT_RANGE;
  if (typeof raw === 'string' && RANGES.some((r) => r.value === raw)) return raw;
  throw new AppError(
    400,
    'That time range is not supported. Choose all time, this year, this month or this week.'
  );
}
