import express from 'express';
import request from 'supertest';
import journalRoutes from './journal';
import { Goal } from '../models/goal';
import { JournalEntry } from '../models/journalEntry';
import authHeaderToken from '../middlewares/authHeaderToken';
import AuthenticatedRequest from '../middlewares/authenticatedRequest';

jest.mock('../models/goal');
jest.mock('../models/journalEntry');
jest.mock('../middlewares/authHeaderToken');
jest.mock('../middlewares/authenticatedRequest');

const app = express();
app.use(express.json());
app.use('/journal', journalRoutes);

describe('Journal Routes', function () {
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

    describe('GET /journal/:goalId', () => {
        it('should return goal and journal entries for the authenticated user', async () => {
            const mockGoal = { id: 'goal-id-1', title: 'Goal 1', description: 'Description 1', user_id: mockUserId };
            const mockEntries = [
                { id: 'entry-id-1', text: 'Entry 1', user_id: mockUserId, goal_id: 'goal-id-1' },
                { id: 'entry-id-2', text: 'Entry 2', user_id: mockUserId, goal_id: 'goal-id-1' }
            ];

            (JournalEntry.findAll as jest.Mock).mockResolvedValue(mockEntries);
            (Goal.findOne as jest.Mock).mockResolvedValue(mockGoal);

            const response = await request(app)
                .get('/journal/goal-id-1')
                .expect(200);

            expect(response.body).toEqual({
                goal: mockGoal,
                entries: mockEntries
            });
        });

        it('should return 500 on error', async () => {
            (JournalEntry.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .get('/journal/goal-id-1')
                .expect(500);

            expect(response.body).toHaveProperty('error', 'Failed to fetch journal');
        });
    });

    describe('POST /journal/create_entry', () => {
        it('should create a new journal entry', async () => {
            const newEntry = { text: 'New Entry', goalId: 'goal-id-1' };
            const createdEntry = { id: 'entry-id-3', ...newEntry, user_id: mockUserId };

            (JournalEntry.create as jest.Mock).mockResolvedValue(createdEntry);

            const response = await request(app)
                .post('/journal/create_entry')
                .send(newEntry)
                .expect(201);

            expect(response.body).toEqual(createdEntry);
        });

        it('should return 500 on error', async () => {
            (JournalEntry.create as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/journal/create_entry')
                .send({ text: 'New Entry', goalId: 'goal-id-1' })
                .expect(500);

            expect(response.body).toHaveProperty('error', 'Failed to create journal entry');
        });
    });

    describe('PUT /journal/edit_entry/:entryId', () => {
        it('should update a journal entry', async () => {
            const updatedEntry = { text: 'Updated Entry', goalId: 'goal-id-1' };

            (JournalEntry.update as jest.Mock).mockResolvedValue([1]); // Mock successful update

            const response = await request(app)
                .put('/journal/edit_entry/entry-id-1')
                .send(updatedEntry)
                .expect(201);

            expect(response.body).toEqual([1]);
        });

        it('should delete a journal entry if text is empty', async () => {
            (JournalEntry.destroy as jest.Mock).mockResolvedValue(1); // Mock successful deletion

            const response = await request(app)
                .put('/journal/edit_entry/entry-id-1')
                .send({ text: '', goalId: 'goal-id-1' })
                .expect(201);

            expect(response.body).toEqual(1);
        });

        it('should return 500 on error', async () => {
            (JournalEntry.update as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .put('/journal/edit_entry/entry-id-1')
                .send({ text: 'Updated Entry', goalId: 'goal-id-1' })
                .expect(500);

            expect(response.body).toHaveProperty('error', 'Failed to create journal entry');
        });
    });
});
