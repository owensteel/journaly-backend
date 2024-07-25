import { Router, Response } from 'express';
import { Goal } from '../models/goal';
import authHeaderToken from '../middlewares/authHeaderToken'
import AuthenticatedRequest from "../middlewares/authenticatedRequest"

const router = Router();

router.get('/', authHeaderToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const goals = await Goal.findAll({
            where: {
                user_id: req.user!.id,
            },
        });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

router.get('/:goalId', authHeaderToken, async (req: AuthenticatedRequest, res: Response) => {
    const goalId = req.params.goalId;
    try {
        const goals = await Goal.findAll({
            where: {
                id: goalId,
                user_id: req.user!.id,
            },
        });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch goal' });
    }
});

router.post('/create', authHeaderToken, async (req: AuthenticatedRequest, res: Response) => {
    const { title, description, endDate } = req.body;

    try {
        const goal = await Goal.create({
            title,
            description,
            user_id: req.user!.id, // Associate goal with the logged-in user
            completed: false,
            end_date: endDate,
            last_notified_at: new Date().toDateString()
        });
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

router.post('/delete', authHeaderToken, async (req: AuthenticatedRequest, res: Response) => {
    const { goalId } = req.body;

    try {
        const goal = await Goal.destroy({
            where: {
                id: goalId,
                user_id: req.user!.id,
            },
        });
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

router.post('/toggle_completed', authHeaderToken, async (req: AuthenticatedRequest, res: Response) => {
    const { goalId } = req.body;

    try {
        const goal = await Goal.findOne({
            where: {
                id: goalId,
                user_id: req.user!.id,
            },
        })
        if (!goal) {
            throw new Error("Goal not found")
        }
        await Goal.update(
            {
                completed: !goal.completed
            },
            {
                where: {
                    id: goalId,
                    user_id: req.user!.id,
                },
            });
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle goal completed' });
    }
});

export default router;
