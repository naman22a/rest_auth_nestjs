import { FORGOT_PASSWORD_PREFIX } from 'src/constants';
import { redis } from 'src/redis';
import { v4 } from 'uuid';

const createForgotPasswordUrl = async (userId: number) => {
    const token = v4();

    await redis.set(
        FORGOT_PASSWORD_PREFIX + token,
        userId,
        'EX',
        1000 * 60 * 60 * 3, // 3 hrs
    );

    return `http://localhost:3000/change-password/${token}`;
};

export default createForgotPasswordUrl;
