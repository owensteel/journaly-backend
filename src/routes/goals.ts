import { Router, Request, Response } from 'express';
import { Goal } from '../models/goal';
import authHeaderToken from '../middlewares/authHeaderToken'

const router = Router();

// Define a type for the request with user info
interface AuthenticatedRequest extends Request {
    user?: any;
}

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

router.post('/', authHeaderToken, async (req: AuthenticatedRequest, res: Response) => {
    const { title, description } = req.body;

    try {
        const goal = await Goal.create({
            title,
            description,
            user_id: req.user!.id, // Associate goal with the logged-in user
        });
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

export default router;
