import AppError from '../utils/AppError.js';
import { RANGES, DEFAULT_RANGE } from '../utils/ranges.js';

const MAX_LENGTH = 64;
const FORBIDDEN = /[\/\\?#%<>\u0000-\u001f]/;

export function checkUsername(raw) {
  const username = String(raw ?? '').trim();
  if (!username) return { error: 'Enter a ListenBrainz username.' };
  if (username.length > MAX_LENGTH) {
    return { error: `Usernames are at most ${MAX_LENGTH} characters long.` };
  }
  if (FORBIDDEN.test(username)) {
    return { error: 'Usernames cannot contain / \\ ? # % < > or control characters.' };
  }
  return { username };
}

export function validateSearchForm(req, res, next) {
  const { username, error } = checkUsername(req.body?.username);
  if (error) {
    const submittedRange = req.body?.range;
    const range = RANGES.some((r) => r.value === submittedRange) ? submittedRange : DEFAULT_RANGE;
    return res.status(400).render('home', {
      title: 'Search',
      error,
      values: { username: String(req.body?.username ?? '').slice(0, MAX_LENGTH), range },
    });
  }
  req.body.username = username;
  next();
}

export function validateUsernameParam(req, res, next) {
  const { username, error } = checkUsername(req.params.username);
  if (error) return next(new AppError(400, error));
  req.username = username;
  next();
}
