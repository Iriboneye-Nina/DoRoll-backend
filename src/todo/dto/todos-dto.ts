import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNotEmpty, MinDate } from 'class-validator';
import { EStatus } from '../status.enum';
import { Type } from 'class-transformer';

export class CreateTodoDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @MinDate(new Date(), { message: 'Deadline must be a future date' })
  @Type(() => Date)
  deadline: Date;

  @ApiProperty({ default: EStatus.PENDING })
  @IsNotEmpty()
  status: EStatus;
}

export class UpdateTodoDto {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  title?: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  description?: string;

  @IsDate()
  @MinDate(new Date(), { message: 'Deadline must be a future date' })
  @Type(() => Date)
  deadline?: Date;

  @IsEnum(EStatus, { message: 'Status must be a valid enum value' })
  status?: EStatus;
}
