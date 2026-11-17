# Listening Post

A small Node.js web app that shows what anyone is listening to. Enter a public
[ListenBrainz](https://listenbrainz.org) username and get that user's **top artists**,
**top tracks** and **recent listens**, with a time-range filter for the top lists.

Built with **Express**, **EJS**, **Axios** and **dotenv** in an MVC-style structure.

## API used

**ListenBrainz API** (MetaBrainz Foundation), free and open.

- Documentation: <https://listenbrainz.readthedocs.io/en/latest/users/api/index.html>
- API root: <https://api.listenbrainz.org>
- No key is needed for public stats. An optional user token only raises rate limits.

Endpoints used:

| Purpose | Request |
| --- | --- |
| Top artists | `GET /1/stats/user/{user_name}/artists?range=&count=` |
| Top tracks | `GET /1/stats/user/{user_name}/recordings?range=&count=` |
| Recent listens | `GET /1/user/{user_name}/listens?count=` |

> Note: ListenBrainz is **not** Spotify. The username is the one from listenbrainz.org.

## Features

- Search form with server-side validation (empty value, too long, forbidden characters, unsupported time range)
- Three different API requests, with the user's input used in every request
- Processed data instead of raw JSON: sorting, bar widths relative to the #1 artist, totals, listens grouped by day
- Time-range filter (all time, this year, this month, this week)
- Friendly empty states ("no results") and friendly error pages
- Handles network errors, timeouts, 404 (unknown user), 401 (bad token), 429 (rate limit), 5xx and empty results
- Respects the API's rate limit (about 1 request per second) with a small request queue and a 60-second in-memory cache
- Responsive layout, partials for header and footer, skip link and keyboard focus styles

## Routes

| Method | Route | Description |
| --- | --- | --- |
| GET | `/` | Home page with the search form |
| POST | `/search` | Validates the form, then redirects to the profile page |
| GET | `/user/:username?range=` | Result page: top artists |
| GET | `/user/:username/tracks?range=` | Result page: top tracks |
| GET | `/user/:username/recent` | Result page: recent listens grouped by day |
| any | everything else | 404 page |

## Installation and run

Requires **Node.js 18 or newer**.

```bash
git clone <your-repo-url>
cd listening-post
npm install
cp .env.example .env     # on Windows: copy .env.example .env
npm start
```

Open <http://localhost:3000>. For auto-restart while developing: `npm run dev`.

### `.env` setup

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | no | Server port (default `3000`) |
| `LISTENBRAINZ_API_URL` | no | API root (default `https://api.listenbrainz.org`) |
| `USER_AGENT` | **yes, please set** | ListenBrainz requires app name/version and contact info, e.g. `ListeningPost/1.0 ( you@example.com )` |
| `LISTENBRAINZ_TOKEN` | no | Your user token from <https://listenbrainz.org/settings/> |

`.env` is ignored by Git. Only `.env.example` (without real values) is committed.

## Project structure

```
listening-post/
├── app.js                       # Express setup, middleware, routes, error handling
├── routes/
│   └── index.js                 # URL -> middleware -> controller
├── controllers/
│   ├── homeController.js        # home page + search form
│   └── userController.js        # result pages
├── services/
│   └── listenbrainzService.js   # all Axios calls, throttling, cache, error mapping
├── middleware/
│   ├── requestLogger.js         # custom: logs method, URL, status, time
│   ├── validateUsername.js      # custom: input validation
│   └── errorHandler.js          # 404 handler + central error handler
├── utils/                       # AppError, time ranges, formatting helpers
├── views/
│   ├── partials/                # header, footer, profile header, range picker
│   └── *.ejs                    # home, artists, tracks, recent, error
├── public/                      # css/ and js/
├── docs/screenshots/            # screenshots used below
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Error handling

- All API calls use `async/await` with `try/catch` inside the service layer.
- Failures are converted to an `AppError` with a user-friendly message; technical details are logged to the console only.
- Controllers pass errors to `next(err)`; one central middleware renders the error page.
- `process.on('unhandledRejection' | 'uncaughtException')` logs anything unexpected so bad input or an API failure never crashes the server.

## Screenshots

Add 2 to 3 screenshots to `docs/screenshots/` and keep the links below:

![Home page](docs/screenshots/home.png)
![Top artists](docs/screenshots/artists.png)
![Error page](docs/screenshots/error.png)

## Credits

Listening data: [ListenBrainz](https://listenbrainz.org) / MetaBrainz Foundation.
Artist links point to [MusicBrainz](https://musicbrainz.org).
