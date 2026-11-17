import * as listenbrainz from '../services/listenbrainzService.js';
import { resolveRange } from '../utils/ranges.js';
import { groupByDay } from '../utils/format.js';

export async function showTopArtists(req, res, next) {
  try {
    const username = req.username;
    const range = resolveRange(req.query.range);
    const stats = await listenbrainz.getTopArtists(username, range, 10);
    res.render('artists', { title: `${username}: top artists`, username, range, active: 'artists', stats });
  } catch (err) {
    next(err);
  }
}

export async function showTopTracks(req, res, next) {
  try {
    const username = req.username;
    const range = resolveRange(req.query.range);
    const stats = await listenbrainz.getTopTracks(username, range, 10);
    res.render('tracks', { title: `${username}: top tracks`, username, range, active: 'tracks', stats });
  } catch (err) {
    next(err);
  }
}

export async function showRecentListens(req, res, next) {
  try {
    const username = req.username;
    const listens = await listenbrainz.getRecentListens(username, 20);
    const days = listens ? groupByDay(listens) : [];
    res.render('recent', {
      title: `${username}: recent listens`,
      username,
      range: 'all_time',
      active: 'recent',
      days,
      total: listens ? listens.length : 0,
    });
  } catch (err) {
    next(err);
  }
}
