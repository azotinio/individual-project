import { DEFAULT_RANGE, resolveRange } from '../utils/ranges.js';

export function showHome(req, res) {
  res.render('home', {
    title: 'Search',
    error: null,
    values: { username: '', range: DEFAULT_RANGE },
  });
}

export function handleSearch(req, res, next) {
  try {
    const range = resolveRange(req.body.range);
    res.redirect(`/user/${encodeURIComponent(req.body.username)}?range=${range}`);
  } catch (err) {
    next(err);
  }
}
