import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class PasswordDto {
  @ApiProperty({ example: 'currentPassword123' })
  @IsString()
  @MinLength(6, {
    message: 'Current password is too short. Minimum 6 characters required.',
  })
  currentPassword: string;

  @ApiProperty({ example: 'newPassword456' })
  @IsString()
  @MinLength(6, {
    message: 'New password is too short. Minimum 6 characters required.',
  })
  newPassword: string;
}
