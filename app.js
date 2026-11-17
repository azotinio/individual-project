import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

import routes from './routes/index.js';
import requestLogger from './middleware/requestLogger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { RANGES } from './utils/ranges.js';
import { formatNumber } from './utils/format.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(requestLogger);

app.use((req, res, next) => {
  res.locals.appName = 'Listening Post';
  res.locals.ranges = RANGES;
  res.locals.examples = ['rob', 'lucifer'];
  res.locals.formatNumber = formatNumber;
  next();
});

app.use('/', routes);

app.use(notFound);
app.use(errorHandler);

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

app.listen(PORT, () => {
  console.log(`Listening Post running at http://localhost:${PORT}`);
});
