import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import {
    RegisterDto,
    LoginDto,
    ForgotPasswordDto,
    ChangePasswordDto,
} from '../dto';
import {
    validateChangePassword,
    validateForgotPassword,
    validateLogin,
    validateRegister,
} from '../validation';
import * as argon2 from 'argon2';
import { ValidationException } from '../validation.exception';
import { Request, Response } from 'express';
import { AuthGuard } from '../auth.guard';
import { withOutPassword } from 'src/users/utils';
import {
    CONFIRM_PREFIX,
    COOKIE_NAME,
    FORGOT_PASSWORD_PREFIX,
} from 'src/constants';
import { sendEmail, createConfirmUrl, createForgotPasswordUrl } from '../utils';
import { redis } from 'src/redis';

@Controller('auth')
export class AuthController {
    constructor(private usersService: UsersService) {}

    @Post('/register')
    async register(@Body() body: RegisterDto) {
        const errors = validateRegister(body);
        if (errors) {
            throw new ValidationException(errors);
        }

        const { name, email, password } = body;

        const userExists = await this.usersService.findOneByEmail(email);
        if (userExists) {
            throw new ValidationException([
                {
                    field: 'email',
                    message: 'Email already in use',
                },
            ]);
        }

        const hashedPassword = await argon2.hash(password);

        const user = await this.usersService.create({
            name,
            email,
            password: hashedPassword,
        });

        await sendEmail(email, await createConfirmUrl(user.id));

        return { ok: true, errors: null };
    }

    @Post('login')
    async login(@Body() body: LoginDto, @Req() req: Request) {
        const errors = validateLogin(body);
        if (errors) {
            throw new ValidationException(errors);
        }

        const { email, password } = body;

        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            throw new ValidationException([
                {
                    field: 'email',
                    message: 'User not found',
                },
            ]);
        }

        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) {
            throw new ValidationException([
                { field: 'password', message: 'Incorrect password' },
            ]);
        }

        if (!user.confirmed) {
            throw new ValidationException([
                {
                    field: 'email',
                    message: 'Please confirm your email',
                },
            ]);
        }

        req.session.userId = user.id;

        return {
            ok: true,
            errors: null,
        };
    }

    @Get('user')
    @UseGuards(AuthGuard)
    async user(@Req() req: Request) {
        const user = await this.usersService.findOneById(req.session.userId);
        return withOutPassword(user);
    }

    @Post('logout')
    @UseGuards(AuthGuard)
    async logout(@Req() req: Request, @Res() res: Response) {
        req.session.destroy((error) => {
            if (error) {
                res.status(500).json({
                    ok: false,
                    errors: [
                        {
                            field: 'server',
                            message: 'Something went wrong',
                        },
                    ],
                });
            } else {
                res.clearCookie(COOKIE_NAME);
                res.status(200).json({
                    ok: true,
                    errors: null,
                });
            }
        });
    }

    @Post('confirm-email/:token')
    async confirmEmail(
        @Param('token', new ParseUUIDPipe({ version: '4' })) token: string,
    ) {
        const userId = parseInt(await redis.get(CONFIRM_PREFIX + token), 10);
        if (!userId) {
            throw new ValidationException([
                {
                    field: 'token',
                    message: 'Something went wrong',
                },
            ]);
        }

        await this.usersService.confirmUser(userId);
        await redis.del(CONFIRM_PREFIX + token);

        return {
            ok: true,
            errors: null,
        };
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDto) {
        const errors = validateForgotPassword(body);
        if (errors) {
            throw new ValidationException(errors);
        }

        const { email } = body;

        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            return {
                ok: true,
            };
        }

        await sendEmail(email, await createForgotPasswordUrl(user.id));

        return {
            ok: true,
        };
    }

    @Patch('change-password/:token')
    async changePassword(
        @Param('token', new ParseUUIDPipe({ version: '4' })) token: string,
        @Body() body: ChangePasswordDto,
    ) {
        const errors = validateChangePassword(body);
        if (errors) throw new ValidationException(errors);

        const userId = parseInt(
            await redis.get(FORGOT_PASSWORD_PREFIX + token),
        );
        if (!userId) {
            throw new ValidationException([
                {
                    field: 'token',
                    message: 'Something went wrong',
                },
            ]);
        }

        const { password } = body;

        const hashedPassword = await argon2.hash(password);
        await this.usersService.changePassword(userId, hashedPassword);
        await redis.del(FORGOT_PASSWORD_PREFIX + token);

        return {
            ok: true,
            errors: null,
        };
    }
}
