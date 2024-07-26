import request from 'supertest';
import express from 'express';
import authRoutes from './auth';
import { User } from '../models';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

jest.mock('google-auth-library');
jest.mock('jsonwebtoken');
jest.mock('../models');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('POST /auth/google', () => {
        it('should create a new user and return a JWT token', async () => {
            const mockToken = 'mock-token';
            const mockPayload = {
                sub: '12345',
                name: 'John Doe',
                email: 'john.doe@example.com',
                picture: 'http://example.com/pic.jpg',
            };

            const mockVerifyIdToken = jest.fn().mockResolvedValue({
                getPayload: () => mockPayload,
            });

            // @ts-ignore: Mock the OAuth2Client instance
            OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;

            (User.findOne as jest.Mock).mockResolvedValue(null); // No existing user
            (User.create as jest.Mock).mockResolvedValue({
                id: 'user-id',
                google_id: '12345',
                name: 'John Doe',
                email: 'john.doe@example.com',
                picture: 'http://example.com/pic.jpg',
                save: jest.fn(),
            });

            (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

            const response = await request(app)
                .post('/auth/google')
                .send({ token: mockToken });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('authToken', 'mock-jwt-token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toEqual({
                id: 'user-id',
                google_id: '12345',
                name: 'John Doe',
                email: 'john.doe@example.com',
                picture: 'http://example.com/pic.jpg',
            });
        });

        it('should return 400 if Google token is invalid', async () => {
            const mockToken = 'invalid-token';

            const mockVerifyIdToken = jest.fn().mockRejectedValue(new Error('Invalid token'));

            // @ts-ignore: Mock the OAuth2Client instance
            OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;

            const response = await request(app)
                .post('/auth/google')
                .send({ token: mockToken });

            expect(response.status).toBe(400);
            expect(response.text).toBe('Error verifying Google token');
        });
    });

    describe('GET /auth/user', () => {
        it('should return user profile if authenticated', async () => {
            const mockUser = {
                id: 'user-id',
                name: 'John Doe',
                email: 'john.doe@example.com',
                picture: 'http://example.com/pic.jpg',
            };

            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            (jwt.verify as jest.Mock).mockReturnValue({ id: 'user-id' });

            const response = await request(app)
                .get('/auth/user')
                .set('Authorization', 'Bearer mock-jwt-token');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUser);
        });

        it('should return 404 if user is not found', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);
            (jwt.verify as jest.Mock).mockReturnValue({ id: 'user-id' });

            const response = await request(app)
                .get('/auth/user')
                .set('Authorization', 'Bearer mock-jwt-token');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found');
        });

        it('should return 500 on server error', async () => {
            (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));
            (jwt.verify as jest.Mock).mockReturnValue({ id: 'user-id' });

            const response = await request(app)
                .get('/auth/user')
                .set('Authorization', 'Bearer mock-jwt-token');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Server error');
        });
    });
});
