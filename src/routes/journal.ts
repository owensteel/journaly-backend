import { Router, Response } from 'express';
import { Goal } from '../models/goal';
import { JournalEntry } from '../models/journalEntry';
import authHeaderToken from '../middlewares/authHeaderToken'
import AuthenticatedRequest from "../middlewares/authenticatedRequest"

const router = Router();

router.get('/:goalId', authHeaderToken, async (req: AuthenticatedRequest, res: Response) => {
    const goalId = req.params.goalId;

    try {
        const journalEntries = await JournalEntry.findAll({
            where: {
                user_id: req.user!.id,
                goal_id: goalId
            },
        });
        const journalGoal = await Goal.findOne({
            where: {
                id: goalId,
                user_id: req.user!.id
            },
        });
        res.json({
            goal: journalGoal,
            entries: journalEntries
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch journal' });
    }
});

router.post('/create_entry', authHeaderToken, async (req: AuthenticatedRequest, res: Response) => {
    const { text, goalId } = req.body;

    try {
        const journalEntry = await JournalEntry.create({
            text,
            user_id: req.user!.id,
            goal_id: goalId
        });
        res.status(201).json(journalEntry);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create journal entry' });
    }
});

export default router;
