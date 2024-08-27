import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Reset token is required' })
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  newPassword: string;
}
