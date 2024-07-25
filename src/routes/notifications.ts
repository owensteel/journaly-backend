// Notifications routes

import { Router, Response } from 'express';
import authHeaderToken from '../middlewares/authHeaderToken'
import AuthenticatedRequest from "../middlewares/authenticatedRequest"
import { Subscription } from '../models/subscription';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const webPush = require('web-push');

const vapidKeys = {
    publicKey: process.env.NOTIFICATIONS_PUBLIC_KEY,
    privateKey: process.env.NOTIFICATIONS_PRIVATE_KEY
};

webPush.setVapidDetails(
    'https://ow.st/', // Contact for example purposes only
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

router.post(
    '/subscribe',
    authHeaderToken,
    async (req: AuthenticatedRequest, res: Response) => {
        const { subscription } = req.body;
        const userId = req.user!.id;

        try {
            // Delete any existing subscriptions
            await Subscription.destroy({
                where: {
                    user_id: userId
                }
            })

            // Record the new one
            const subscriptionRecord = await Subscription.create({
                user_id: userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            });

            res.status(201).json({ message: 'Subscription saved.', subscriptionRecord });
        } catch (error) {
            console.error('Error saving subscription:', error);
            res.status(500).json({ error: 'Failed to save subscription.' });
        }
    }
);

export default router