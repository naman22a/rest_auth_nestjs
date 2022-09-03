import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './controllers/auth.controller';

@Module({
    imports: [UsersModule],
    controllers: [AuthController],
})
export class AuthModule {}
