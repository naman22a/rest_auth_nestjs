import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user.model';
import { Repository } from 'typeorm';
import { UserDto } from '../dto/user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
    ) {}

    async findAll() {
        return await this.userRepository.find();
    }

    async findOneByEmail(email: string) {
        return await this.userRepository.findOneBy({ email });
    }

    async findOneById(id: number) {
        return await this.userRepository.findOneBy({ id });
    }

    async create(userDto: UserDto) {
        return await this.userRepository.create(userDto).save();
    }

    async confirmUser(userId: number) {
        return await this.userRepository.update(
            { id: userId },
            { confirmed: true },
        );
    }

    async changePassword(userId: number, newPassword: string) {
        return await this.userRepository.update(
            { id: userId },
            { password: newPassword },
        );
    }
}
