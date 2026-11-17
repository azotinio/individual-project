const numberFormat = new Intl.NumberFormat('en-US');
export const formatNumber = (n) => numberFormat.format(n);

const dayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
});

export function groupByDay(listens) {
  const groups = new Map();
  for (const listen of listens) {
    const label = dayFormat.format(listen.listenedAt);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push({ ...listen, time: timeFormat.format(listen.listenedAt) });
  }
  return [...groups].map(([label, items]) => ({ label, items }));
}
