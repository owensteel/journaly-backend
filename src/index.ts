import express from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth';

const app = express();

app.use(bodyParser.json());
app.use(
    cors({
        origin: process.env.FRONTEND_ORIGIN!, // Allow requests from this origin
        credentials: true, // Allow cookies to be sent
    })
);
app.use(
    cookieSession({
        name: 'session',
        keys: [process.env.COOKIE_KEY!],
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })
);

app.use('/auth', authRoutes);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
