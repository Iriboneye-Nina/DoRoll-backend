import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  deadline: Date;

  @ApiProperty({ default: false })
  isDone?: boolean;
}

export class UpdateTodoDto {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  title?: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  deadline: Date;

  @ApiProperty({ required: false, default: false })
  isDone?: boolean;
}
