import { isEmail, isEmpty, minLength } from 'class-validator';
import { FieldError } from 'src/types';
import { ChangePasswordDto } from '../dto/changePassword.dto';
import { ForgotPasswordDto } from '../dto/forgotPassword.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

export const validateRegister = (registerDto: RegisterDto) => {
    const errors: FieldError[] = [];
    const { name, email, password } = registerDto;

    if (isEmpty(name)) {
        errors.push({
            field: 'name',
            message: 'Name can not be blank',
        });
    }

    if (!isEmail(email)) {
        errors.push({
            field: 'email',
            message: 'Invalid Email',
        });
    }

    if (!minLength(password, 6)) {
        errors.push({
            field: 'password',
            message: 'Password must be atleast 6 characters long',
        });
    }

    return errors.length === 0 ? null : errors;
};

export const validateLogin = (loginDto: LoginDto) => {
    const errors: FieldError[] = [];
    const { email, password } = loginDto;

    if (!isEmail(email)) {
        errors.push({
            field: 'email',
            message: 'Invalid Email',
        });
    }

    if (isEmpty(password)) {
        errors.push({
            field: 'password',
            message: 'Password can not blank',
        });
    }

    return errors.length === 0 ? null : errors;
};

export const validateForgotPassword = ({ email }: ForgotPasswordDto) => {
    const errors: FieldError[] = [];

    if (!isEmail(email)) {
        errors.push({
            field: 'email',
            message: 'Invalid Email',
        });
    }

    return errors.length === 0 ? null : errors;
};

export const validateChangePassword = ({ password }: ChangePasswordDto) => {
    const errors: FieldError[] = [];

    if (!minLength(password, 6)) {
        errors.push({
            field: 'password',
            message: 'Password must be atleast 6 characters long',
        });
    }

    return errors.length === 0 ? null : errors;
};
