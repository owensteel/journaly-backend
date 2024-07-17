import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);

router.options('/google', (req, res) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN!); // Allow from this origin
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

router.post('/google', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID!,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).send('Invalid Google token');
        }

        const user = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
        };

        const authToken = jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '1h' });

        res.status(200).json({ authToken });
    } catch (error) {
        res.status(400).send('Error verifying Google token');
    }
});

router.get('/logout', (req, res) => {
    // req.logout();
    res.redirect('/');
});

router.get('/current_user', (req, res) => {
    res.send(req.user);
});

export default router;
