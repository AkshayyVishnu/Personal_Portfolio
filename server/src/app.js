const express = require('express');
const cors = require('cors');
const projectsRouter = require('./routes/projects');
const contactRouter = require('./routes/contact');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json());

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/projects', projectsRouter);
  app.use('/api/contact', contactRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
