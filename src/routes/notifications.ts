// Notifications routes

import { Router, Request, Response } from 'express';
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

let subscriptions: PushSubscription[] = [];

router.post('/subscribe', (req: Request, res: Response) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    res.status(201).json({});
});

router.post('/send-notification', (req: Request, res: Response) => {
    const { title, body, icon, badge } = req.body;
    const payload = JSON.stringify({ title, body, icon, badge });

    Promise.all(subscriptions.map(sub =>
        webPush.sendNotification(sub, payload)
    ))
        .then(() => res.status(200).json({ message: 'Notification sent' }))
        .catch(err => {
            console.error('Error sending notification:', err);
            res.status(500).json({ error: 'Failed to send notification' });
        });
});

export default router