import express from 'express';
import routes from './routes/routes.js';

const app = express();

app.use('/', routes)

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});