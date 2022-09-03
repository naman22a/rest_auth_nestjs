import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        if (!request.session.userId) {
            throw new UnauthorizedException({
                ok: false,
                errors: [
                    {
                        field: 'auth',
                        message: 'Unauthorized',
                    },
                ],
            });
        }

        return true;
    }
}
