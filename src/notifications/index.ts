// Notifications scheduling

import { Goal } from '../models/goal';
import { Subscription } from '../models/subscription';
import dotenv from 'dotenv';

dotenv.config();

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

const sendNotification = async (subscription: object, payload: string) => {
    try {
        await webPush.sendNotification(subscription, payload);
    } catch (error) {
        console.error('Error sending notification', error);
    }
};

// Check notifications
const daysBetweenReminders = 7;
const checkNotifications = async () => {
    const subscriptions = await Subscription.findAll();
    for (const subscription of subscriptions) {
        const goals = await Goal.findAll({
            where: {
                user_id: subscription.user_id,
                completed: false
            }
        });
        goals.forEach(async (goal: Goal) => {
            const payload = JSON.stringify({
                title: `Checking in on ${goal.title}...`,
                message: `How's this going? Take a moment to journal any updates today.`,
                url: `http://journaly.ow.st/journal/${goal.id}/entries`
            });

            const dayDifference = Math.floor(
                (new Date().getTime() - new Date(goal.last_notified_at).getTime()) / (1000 * 60 * 60 * 24)
            );

            if (dayDifference >= daysBetweenReminders) {
                await Goal.update(
                    {
                        last_notified_at: new Date().toString()
                    },
                    {
                        where: {
                            id: goal.id
                        }
                    }
                )

                sendNotification({
                    endpoint: subscription.endpoint,
                    keys: {
                        auth: subscription.auth,
                        p256dh: subscription.p256dh
                    }
                }, payload);
            }
        });
    }
};

const initScheduler = () => {
    // Call this function periodically (e.g., every hour) to check and send notifications
    setInterval(() => {
        checkNotifications()
    }, 60 * 60 * 1000)

    // Initial "wake-up" call
    setTimeout(() => {
        checkNotifications()
    }, 30 * 1000)
}

export { initScheduler }