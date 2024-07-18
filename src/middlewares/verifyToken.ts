// verifyToken
import jwt, { JwtPayload } from 'jsonwebtoken';

interface UserPayload extends JwtPayload {
    id: string;
    email: string;
    name: string;
    picture: string;
}

const verifyToken = (token: string): UserPayload => {
    if (!token) {
        throw new Error('Auth token is missing');
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
        return user;
    } catch (error) {
        throw new Error('Invalid auth token');
    }
};

export default verifyToken