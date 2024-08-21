import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  data?: T;

  constructor(statusCode: number, status: string, message: string, data?: T) {
    this.statusCode = statusCode;
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
