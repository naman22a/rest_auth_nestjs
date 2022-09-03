import { CONFIRM_PREFIX } from 'src/constants';
import { redis } from 'src/redis';
import { v4 } from 'uuid';

const createConfirmUrl = async (userId: number) => {
    const token = v4();

    await redis.set(
        CONFIRM_PREFIX + token,
        userId,
        'EX',
        1000 * 60 * 60 * 24 * 3, // 3 days
    );

    return `http://localhost:3000/confirm/${token}`;
};

export default createConfirmUrl;
