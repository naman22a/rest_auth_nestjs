import { Controller, Get } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { withOutPassword } from '../utils';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get()
    async findAll() {
        const users = await this.usersService.findAll();
        return users.map((user) => withOutPassword(user));
    }
}
