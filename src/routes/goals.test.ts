import express from 'express';
import request from 'supertest';
import goalsRoutes from '../routes/goals';
import { Goal } from '../models/goal';
import authHeaderToken from '../middlewares/authHeaderToken';
import AuthenticatedRequest from '../middlewares/authenticatedRequest';

jest.mock('../models/goal');
jest.mock('../middlewares/authHeaderToken');
jest.mock('../middlewares/authenticatedRequest');

const app = express();
app.use(express.json());
app.use('/goals', goalsRoutes);

describe('Goals Routes', function () {
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

    describe('GET /goals', () => {
        it('should return all goals for the authenticated user', async () => {
            const mockGoals = [
                { id: 'goal-id-1', title: 'Goal 1', description: 'Description 1', user_id: mockUserId, completed: false, end_date: '2024-12-31', last_notified_at: new Date().toDateString() },
                { id: 'goal-id-2', title: 'Goal 2', description: 'Description 2', user_id: mockUserId, completed: true, end_date: '2024-11-30', last_notified_at: new Date().toDateString() }
            ];

            (Goal.findAll as jest.Mock).mockResolvedValue(mockGoals);

            const response = await request(app)
                .get('/goals')
                .expect(200);

            expect(response.body).toEqual(mockGoals);
        });

        it('should return 500 on error', async () => {
            (Goal.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .get('/goals')
                .expect(500);

            expect(response.body).toHaveProperty('error', 'Failed to fetch goals');
        });
    });

    describe('GET /goals/:goalId', () => {
        it('should return a specific goal for the authenticated user', async () => {
            const mockGoal = { id: 'goal-id-1', title: 'Goal 1', description: 'Description 1', user_id: mockUserId, completed: false, end_date: '2024-12-31', last_notified_at: new Date().toDateString() };

            (Goal.findAll as jest.Mock).mockResolvedValue([mockGoal]);

            const response = await request(app)
                .get('/goals/goal-id-1')
                .expect(200);

            expect(response.body).toEqual([mockGoal]);
        });

        it('should return 500 on error', async () => {
            (Goal.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .get('/goals/goal-id-1')
                .expect(500);

            expect(response.body).toHaveProperty('error', 'Failed to fetch goal');
        });
    });

    describe('POST /goals/create', () => {
        it('should create a new goal', async () => {
            const newGoal = { title: 'New Goal', description: 'New Goal Description', endDate: '2024-12-31' };
            const createdGoal = { id: 'goal-id-3', ...newGoal, user_id: mockUserId, completed: false, last_notified_at: new Date().toDateString() };

            (Goal.create as jest.Mock).mockResolvedValue(createdGoal);

            const response = await request(app)
                .post('/goals/create')
                .send(newGoal)
                .expect(201);

            expect(response.body).toEqual(createdGoal);
        });

        it('should return 500 on error', async () => {
            (Goal.create as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/goals/create')
                .send({ title: 'New Goal', description: 'New Goal Description', endDate: '2024-12-31' })
                .expect(500);

            expect(response.body).toHaveProperty('error', 'Failed to create goal');
        });
    });

    describe('POST /goals/delete', () => {
        it('should delete a goal', async () => {
            (Goal.destroy as jest.Mock).mockResolvedValue(1); // Mock successful deletion

            const response = await request(app)
                .post('/goals/delete')
                .send({ goalId: 'goal-id-1' })
                .expect(201);

            expect(response.body).toEqual(1);
        });

        it('should return 500 on error', async () => {
            (Goal.destroy as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/goals/delete')
                .send({ goalId: 'goal-id-1' })
                .expect(500);

            expect(response.body).toHaveProperty('error', 'Failed to delete goal');
        });
    });

    describe('POST /goals/toggle_completed', () => {
        it('should toggle the completion status of a goal', async () => {
            const mockGoal = { id: 'goal-id-1', title: 'Goal 1', description: 'Description 1', user_id: mockUserId, completed: false, end_date: '2024-12-31', last_notified_at: new Date().toDateString() };

            (Goal.findOne as jest.Mock).mockResolvedValue(mockGoal);
            (Goal.update as jest.Mock).mockResolvedValue([1]); // Mock successful update

            const response = await request(app)
                .post('/goals/toggle_completed')
                .send({ goalId: 'goal-id-1' })
                .expect(201);

            expect(response.body).toEqual(mockGoal);
        });

        it('should return 500 on error if goal not found', async () => {
            (Goal.findOne as jest.Mock).mockResolvedValue(null);

            const response = await request(app)
                .post('/goals/toggle_completed')
                .send({ goalId: 'goal-id-1' })
                .expect(500);

            expect(response.body).toHaveProperty('error', 'Failed to toggle goal completed');
        });

        it('should return 500 on error', async () => {
            (Goal.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/goals/toggle_completed')
                .send({ goalId: 'goal-id-1' })
                .expect(500);

            expect(response.body).toHaveProperty('error', 'Failed to toggle goal completed');
        });
    });
});
