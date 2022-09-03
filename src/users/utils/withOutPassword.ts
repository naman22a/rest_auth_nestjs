import { User } from 'src/models/user.model';

const withOutPassword = (user: User) => {
    const { password, ...result } = user;
    return result;
};

export default withOutPassword;
