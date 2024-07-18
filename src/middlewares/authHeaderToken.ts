// authHeaderToken
import { Request, Response } from 'express';
import verifyToken from "./verifyToken";

const authHeaderToken = (req: Request, res: Response, next: Function) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).send('Access Denied');

    try {
        const user = verifyToken(token);
        (req as any).user = user; // Add user data to request object for further use
        next();
    } catch (error) {
        res.status(401).send('Invalid auth token');
    }
};

export default authHeaderToken