import { ApiProperty } from '@nestjs/swagger';
export class MarkTodoDto {
  @ApiProperty()
  status: 'DONE';
}
