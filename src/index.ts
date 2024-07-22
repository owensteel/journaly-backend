import express from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth';
import goalsRoutes from './routes/goals'
import journalRoutes from './routes/journal'

const app = express();

app.use(bodyParser.json());
app.use(
    cors({
        origin: "*",
        credentials: true,
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
app.use('/api/goals', goalsRoutes);
app.use('/api/journal', journalRoutes);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
