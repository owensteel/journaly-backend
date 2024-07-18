import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import jwt, { JwtPayload } from 'jsonwebtoken';

dotenv.config();

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);

interface UserPayload extends JwtPayload {
    id: string;
    email: string;
    name: string;
    picture: string;
}

const verifyToken = (token: string): UserPayload => {
    if (!token) {
        throw new Error('Auth token is missing');
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
        return user;
    } catch (error) {
        throw new Error('Invalid auth token');
    }
};

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

        res.status(200).json({ authToken, user });
    } catch (error) {
        res.status(400).send('Error verifying Google token');
    }
});

router.get('/user', (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];

    try {
        const user = verifyToken(token!);
        const { name, picture } = user;
        res.status(200).json({ name, picture });
    } catch (error) {
        res.status(401).json({ message: String(error) });
    }
});

export default router;
