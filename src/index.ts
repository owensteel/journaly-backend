import express from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth';
import goalsRoutes from './routes/goals'
import journalRoutes from './routes/journal'

const app = express();

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];

app.use(bodyParser.json());
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
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
