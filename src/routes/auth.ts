import { Router, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import authHeaderToken from '../middlewares/authHeaderToken';
import AuthenticatedRequest from "../middlewares/authenticatedRequest"

dotenv.config();

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);

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

        let user = await User.findOne({ where: { google_id: payload.sub } });

        if (!user) {
            // Create new user if not exists
            user = await User.create({
                google_id: payload.sub,
                name: payload.name || '',
                email: payload.email || '',
                picture: payload.picture || '',
            });
        } else {
            // Update user details if already exists
            user.name = payload.name || '';
            user.email = payload.email || '';
            user.picture = payload.picture || '';
            await user.save();
        }

        const authToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.status(200).json({ authToken, user });
    } catch (error) {
        console.error('Error verifying Google token:', error);
        res.status(400).send('Error verifying Google token');
    }
});

router.get('/user', authHeaderToken, async (req: AuthenticatedRequest, res: Response) => {
    // Returns user profile from DB rather than data encoded in token
    // so it is up-to-date
    try {
        // Find the user in the database using the decoded token
        const user = await User.findOne({ where: { id: req.user!.id } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return the user profile data
        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            picture: user.picture,
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
