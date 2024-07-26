import express from 'express';
import request from 'supertest';
import notificationsRoutes from './notifications';
import { Subscription } from '../models/subscription';
import authHeaderToken from '../middlewares/authHeaderToken';
import AuthenticatedRequest from '../middlewares/authenticatedRequest';

jest.mock('../models/subscription');
jest.mock('../middlewares/authHeaderToken');

const app = express();
app.use(express.json());
app.use('/notifications', notificationsRoutes);

describe('Notifications Routes', function () {
    let mockUserId: string;

    beforeEach(() => {
        mockUserId = 'user-id';
        // Mock the authenticated user
        (authHeaderToken as jest.Mock).mockImplementation((req, res, next) => {
            (req as any).user = { id: mockUserId };
            next();
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('POST /notifications/subscribe', () => {
        it('should save a subscription and return a success message', async () => {
            const mockSubscription = {
                endpoint: 'https://example.com/endpoint',
                keys: {
                    p256dh: 'p256dh-key',
                    auth: 'auth-key'
                }
            };

            const mockSubscriptionRecord = {
                user_id: mockUserId,
                endpoint: mockSubscription.endpoint,
                p256dh: mockSubscription.keys.p256dh,
                auth: mockSubscription.keys.auth,
            };

            (Subscription.destroy as jest.Mock).mockResolvedValue(undefined);
            (Subscription.create as jest.Mock).mockResolvedValue(mockSubscriptionRecord);

            const response = await request(app)
                .post('/notifications/subscribe')
                .send({ subscription: mockSubscription })
                .expect(201);

            expect(response.body).toEqual({
                message: 'Subscription saved.',
                subscriptionRecord: mockSubscriptionRecord
            });
        });

        it('should return 500 on error', async () => {
            (Subscription.destroy as jest.Mock).mockResolvedValue(undefined);
            (Subscription.create as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/notifications/subscribe')
                .send({
                    subscription: {
                        endpoint: 'https://example.com/endpoint',
                        keys: {
                            p256dh: 'p256dh-key',
                            auth: 'auth-key'
                        }
                    }
                })
                .expect(500);

            expect(response.body).toHaveProperty('error', 'Failed to save subscription.');
        });
    });
});
