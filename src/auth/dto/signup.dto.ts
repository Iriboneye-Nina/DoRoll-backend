import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  Matches,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('RW')
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;
}
