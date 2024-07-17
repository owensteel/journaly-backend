import express from 'express';
import passport from 'passport';
import cookieSession from 'cookie-session';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());
app.use(
    cookieSession({
        name: 'session',
        keys: [process.env.COOKIE_KEY!],
        maxAge: 24 * 60 * 60 * 1000,
    })
);

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
