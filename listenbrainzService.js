import axios from 'axios';
import AppError from '../utils/AppError.js';

const BASE_URL = process.env.LISTENBRAINZ_API_URL || 'https://api.listenbrainz.org';

const USER_AGENT = process.env.USER_AGENT || 'ListeningPost/1.0 ( set-USER_AGENT-in-.env )';
if (!process.env.USER_AGENT) {
  console.warn('[config] USER_AGENT is not set in .env. ListenBrainz asks for contact info in the User-Agent.');
}

const headers = { 'User-Agent': USER_AGENT, Accept: 'application/json' };
if (process.env.LISTENBRAINZ_TOKEN) {
  headers.Authorization = `Token ${process.env.LISTENBRAINZ_TOKEN}`;
}

const http = axios.create({ baseURL: BASE_URL, timeout: 8000, headers });

const MIN_GAP_MS = 1100;
let nextSlot = 0;

async function waitForSlot() {
  const now = Date.now();
  const startAt = Math.max(now, nextSlot);
  nextSlot = startAt + MIN_GAP_MS;
  if (startAt > now) await new Promise((resolve) => setTimeout(resolve, startAt - now));
}

const CACHE_TTL_MS = 60_000;
const CACHE_MAX_ENTRIES = 200;
const cache = new Map();

async function request(path, params = {}) {
  const key = `${path}?${new URLSearchParams(params).toString()}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  await waitForSlot();

  try {
    const response = await http.get(path, { params });
    const value = response.status === 204 ? null : response.data;

    cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
    if (cache.size > CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value);
    return value;
  } catch (err) {
    throw toAppError(err);
  }
}

function toAppError(err) {
  if (err instanceof AppError) return err;

  console.error('[ListenBrainz API]', err.code || '', err.response?.status || '', err.message);

  if (err.response) {
    const { status, headers: resHeaders } = err.response;
    if (status === 404) {
      return new AppError(404, 'We could not find that ListenBrainz user. Check the spelling and try again.');
    }
    if (status === 400) {
      return new AppError(400, 'ListenBrainz did not accept that request. Try different options.');
    }
    if (status === 401) {
      return new AppError(502, 'ListenBrainz rejected the API token set for this app. Check LISTENBRAINZ_TOKEN in .env.');
    }
    if (status === 429) {
      const wait = resHeaders?.['x-ratelimit-reset-in'];
      return new AppError(
        429,
        `ListenBrainz is limiting requests right now. Wait ${wait ? `${wait} seconds` : 'a moment'} and try again.`
      );
    }
    if (status >= 500) {
      return new AppError(502, 'ListenBrainz is having problems right now. Try again in a few minutes.');
    }
    return new AppError(502, 'ListenBrainz sent an unexpected response.');
  }

  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    return new AppError(504, 'ListenBrainz took too long to respond. Try again.');
  }
  if (['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'EAI_AGAIN', 'ENETUNREACH'].includes(err.code)) {
    return new AppError(503, 'Cannot reach ListenBrainz. Check your internet connection and try again.');
  }
  return new AppError(500, 'Something went wrong while contacting ListenBrainz.');
}

export async function getTopArtists(username, range = 'all_time', count = 10) {
  const data = await request(`/1/stats/user/${encodeURIComponent(username)}/artists`, { range, count });
  const raw = data?.payload?.artists;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const artists = raw
    .map((a) => ({
      name: a.artist_name,
      mbid: a.artist_mbids?.[0] || null,
      listens: Number(a.listen_count) || 0,
    }))
    .filter((a) => a.name)
    .sort((a, b) => b.listens - a.listens);
  if (artists.length === 0) return null;

  const max = artists[0].listens || 1;
  for (const a of artists) a.percent = Math.max(3, Math.round((a.listens / max) * 100));

  return {
    artists,
    totalArtists: data.payload.total_artist_count ?? artists.length,
    totalListens: artists.reduce((sum, a) => sum + a.listens, 0),
  };
}

export async function getTopTracks(username, range = 'all_time', count = 10) {
  const data = await request(`/1/stats/user/${encodeURIComponent(username)}/recordings`, { range, count });
  const raw = data?.payload?.recordings;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const tracks = raw
    .map((t) => ({
      title: t.track_name,
      artist: t.artist_name,
      release: t.release_name || null,
      listens: Number(t.listen_count) || 0,
    }))
    .filter((t) => t.title)
    .sort((a, b) => b.listens - a.listens);
  if (tracks.length === 0) return null;

  return {
    tracks,
    totalTracks: data.payload.total_recording_count ?? tracks.length,
    totalListens: tracks.reduce((sum, t) => sum + t.listens, 0),
  };
}

export async function getRecentListens(username, count = 20) {
  const data = await request(`/1/user/${encodeURIComponent(username)}/listens`, { count });
  const raw = data?.payload?.listens;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const listens = raw
    .map((l) => ({
      title: l.track_metadata?.track_name,
      artist: l.track_metadata?.artist_name,
      release: l.track_metadata?.release_name || null,
      listenedAt: new Date(Number(l.listened_at) * 1000),
    }))
    .filter((l) => l.title && !Number.isNaN(l.listenedAt.getTime()));

  return listens.length ? listens : null;
}
