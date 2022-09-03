import { HttpException, HttpStatus } from '@nestjs/common';
import { FieldError } from 'src/types';

export class ValidationException extends HttpException {
    constructor(errors: FieldError[]) {
        super({ ok: false, errors }, HttpStatus.NOT_ACCEPTABLE);
    }
}
