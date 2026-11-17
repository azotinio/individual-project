import AppError from '../utils/AppError.js';

const HEADINGS = {
  400: 'That does not look right',
  404: 'Not found',
  429: 'Slow down a little',
  502: 'ListenBrainz had a problem',
  503: 'Cannot reach ListenBrainz',
  504: 'ListenBrainz took too long',
};

export function notFound(req, res, next) {
  next(new AppError(404, 'That page does not exist. Check the address or go back to the search.'));
}

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    console.error(`[error] ${req.method} ${req.originalUrl} -> ${err.status}: ${err.message}`);
  } else {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  if (res.headersSent) return next(err);

  const isAppError = err instanceof AppError;
  const status = isAppError
    ? err.status
    : err.status >= 400 && err.status < 500
      ? err.status
      : 500;
  const message = isAppError
    ? err.message
    : status < 500
      ? 'That request could not be processed.'
      : 'Something unexpected went wrong on our side. Please try again.';

  res.status(status).render(
    'error',
    { title: HEADINGS[status] || 'Something went wrong', status, message },
    (renderErr, html) => {
      if (renderErr) {
        console.error('[error] could not render error page', renderErr);
        return res.type('text/plain').send(`${status}: ${message}`);
      }
      res.send(html);
    }
  );
}
