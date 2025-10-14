import express from 'express';
import routes from './routes/routes.js';
import cookieParser from 'cookie-parser';
const app = express();

app.use('/', routes)
app.use(cookieParser())

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});