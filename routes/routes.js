import express from 'express';

import api from './api/api.js';

const routes = express.Router();

routes.use('/api', api);

routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' });
});

export default routes;