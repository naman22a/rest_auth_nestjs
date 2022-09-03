import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import { COOKIE_NAME, __prod__ } from './constants';
import { redis } from './redis';

declare module 'express-session' {
    interface SessionData {
        userId: number;
    }
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const RedisStore = connectRedis(session);

    app.use(
        session({
            name: COOKIE_NAME,
            secret: process.env.SESSION_SECRET!,
            resave: false,
            cookie: {
                sameSite: 'lax',
                httpOnly: true,
                secure: __prod__,
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            },
            store: new RedisStore({ client: redis }),
            saveUninitialized: false,
        }),
    );

    await app.listen(5000);
}
bootstrap();
